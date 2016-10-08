import app from '../../server/server';
import {FlapMap} from './map';
import {FlapAPI} from './api';
import {ERRORS} from '../../common/utils/errors';
import faker from 'faker';
import _ from 'lodash';
import co from 'co';

// пока пропускаем все id с фейсбука, кроме тек у кого совпала почта с сущестующим пользователем
const FACEBOOK_IDS = new Set();

function getInt(flapId) {
  let id = parseInt(flapId);
  if (!id) throw 'Wrong ID';
  return id;
}

export class Flap {
  static * syncObject(flapId, currentUserId) {
    let id = getInt(flapId);
    let FObject = app.models.FObject;

    let data = yield (FlapAPI.getObject(id));
    let obj = yield (FObject.findOne({where: {'flap.id': id}}));

    if (!obj) {
      if (!['opened', 'added'].includes(data.status)) throw ERRORS.badRequest('Cannot parse data');
      obj = new FObject();
      obj.flap = {id: id};
    }
    FlapMap.mapObject(obj, data);
    let res = yield (obj.save({timestamps: {created: false}}));
    if (currentUserId === '568194a442b1de1c0045a333') {
      // if stanislav
      // async call to Flap.syncReviews
      let promise = co.wrap(Flap.syncReviews);
      promise(flapId).then(reviews=> {
      }, (error)=> {
        console.log('got error during syncReviews', error);
      });
    }
    return res;
  }

  static * syncReviews(objectFlapId) {
    let FObject = app.models.FObject;
    let Story = app.models.Story;
    let obj = yield (FObject.findOne({where: {'flap.id': objectFlapId}}));
    if (!obj)
      throw `Object with flapId: ${objectFlapId} is not created in flaper yet`;

    let rows = yield (FlapAPI.getReviews(objectFlapId));
    let flapUsersIds = _.uniq(rows.map(row=>row.SObjectId));
    let idsToUserMap = yield (Flap.syncUsers(flapUsersIds));

    let reviews = [];
    for (let row of rows) {
      let review = yield (Story.findOne({where: {flapId: row.id}}));
      let user = idsToUserMap.get(row.SObjectId);
      // possible user with facebook account
      if (!user) continue;
      if (!review) {
        let reviewData = {
          flapId: row.id, objectId: obj.id, userId: user.id, type: Story.TYPE.REVIEW,
          rating: row.rating, status: row.status, content: row.data, title: row.title,
          created: row.date, updated: row.date
        };
        try {
          review = yield (Story.create(reviewData, {
            alphaMin: false, skipIgnore: {flapId: false, status: false},
            timestamps: {created: false, updated: false}
          }));
        } catch (e) {
          console.log('catch e', e);
        }
      }
      if (review) {
        reviews.push(review);
      }
    }
    return reviews;
  }

  static * syncUsers(flapIds) {
    flapIds = _.uniq(flapIds.map(id=>+id));
    let User = app.models.user;
    let users = yield (User.find({where: {flapIds: {inq: flapIds}}}));
    let existedIds = [];
    for (let user of users) {
      existedIds = existedIds.concat(user.flapIds)
    }
    let ids = flapIds.filter(id=>!FACEBOOK_IDS.has(id) && !existedIds.includes(id));

    let map = yield (Flap._syncUsersAdd(ids));
    for (let flapId of flapIds) {
      if (map.has(flapId)) continue;
      /* jshint loopfunc:true */
      let user = users.find(u=>u.flapIds.includes(flapId));
      if (user) {
        map.set(flapId, user);
      }
    }
    return map;
  }

  static * _syncUsersAdd(flapIds) {
    let map = new Map();
    if (flapIds.length === 0) return map;
    let flapUsers = yield (FlapAPI.getUsers(flapIds));
    for (let flapUser of flapUsers) {
      map.set(flapUser.id, yield (Flap._syncUser(flapUser)));
    }
    return map;
  }

  static * _syncUser(data) {
    let id = data.id;
    if (data.deleted || FACEBOOK_IDS.has(id)) {
      return null;
    }
    let UserIdentity = app.models.UserIdentity;
    let User = app.models.user;

    let user = yield (User.findOne({where: {flapIds: id}}));
    if (user) {
      //do nothing for now if user already in db
      return user;
    }

    let providersMap = {
      'odnoklassniki.ru': 'odnoklassniki-login',
      'vk.com': 'vk-login',
      'facebook.com': 'facebook-login',
      'mail.ru': 'mail-login'
    };
    let provider = providersMap[data.domain];
    if (!provider) throw ERRORS.error(`Wrong flap provider "${data.domain}"`);
    if (!data.domainId) throw ERRORS.error('DomainId should be provided');

    let identityData = {provider, externalId: data.domainId};
    let identity = yield (UserIdentity.findOne({where: identityData}));
    let userData;

    if (identity) {
      user = yield (User.findByIdRequired(identity.userId));
    } else {
      userData = {
        displayName: data.title, photo: data.pictureLink, photoLarge: data.bigPictureLink,
        created: data.creationDate * 1000, username: `${identityData.provider}.${identityData.externalId}`,
        email: data.email || `${identityData.externalId}@loopback.${identityData.provider.replace(/-.*/, '')}.com`,
        flapIds: [data.id],
        password: faker.internet.password()
      };
      if (data.email) {
        user = yield (User.findOne({where: {email: data.email}}));
      }
    }
    if (user) {
      user.flapIds = user.flapIds || [];
      user.flapIds.push(data.id);
      yield (user.save());
    } else {
      if (provider === 'facebook-login') {
        FACEBOOK_IDS.add(id);
        // we don't create users from facebook yet, as they have different ids in different apps
        return null;
      }
      user = yield (User.create(userData));
    }

    if (!identity) {
      if (provider === 'facebook-login') {
        FACEBOOK_IDS.add(id);
        // we don't create users from facebook yet, as they have different ids in different apps
        return null;
      }
      identityData.userId = user.id;
      identityData.createdByFlapId = data.id;
      identity = new UserIdentity(identityData);
      yield (identity.save());
    }

    return user;
  }
}
