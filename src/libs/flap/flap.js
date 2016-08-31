import app from '../../server/server';
import {FlapMap} from './map';
import {FlapAPI} from './api';
import {ERRORS} from '../../common/utils/errors';
import faker from 'faker';

function getInt(flapId) {
  let id = parseInt(flapId);
  if (!id) throw 'Wrong ID';
  return id;
}

export class Flap {
  static * syncObject(flapId) {
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
    return yield (obj.save({skipTimestampCreated: true}));
  }

  static * syncUser(flapId) {
    let id = getInt(flapId);
    let data = yield (FlapAPI.getUser(id));
    data.id = +data.id;
    data.email = data.email ? data.email.toLowerCase() : null;
    let providersMap = {
      'odnoklassniki.ru': 'odnoklassniki-login',
      'vk.com': 'vk-login',
      'facebook.com': 'facebook-login',
      'mail.ru': 'mail-login'
    };
    let provider = providersMap[data.domain];
    if (!provider) throw ERRORS.error(`Wrong flap provider "${data.domain}"`);
    if (!data.domainId) throw ERRORS.error('DomainId should be provided');

    let UserIdentity = app.models.UserIdentity;
    let User = app.models.user;

    let user = yield (User.findOne({where: {flapIds: data.id}}));
    if (user) {
      //do nothing for now if user already in db
      return user;
    }

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
        // we don't create users from facebook yet, as they have different ids in different apps
        return null;
      }
      user = yield User.create(userData);
    }

    if (!identity) {
      if (provider === 'facebook-login') {
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
