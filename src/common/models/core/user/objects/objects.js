import {App} from '../../../../services/App';
import {ERRORS} from '../../../../utils/errors';
import _ from 'lodash';

/**object owners*/
export function initObjects(User) {
  User.addObject = addObject;
  User.getObjects = getObjects;
  User.isOwner = isOwner;

  User.remoteMethod('addObject', {
    http: {verb: 'put', path: '/:id/objects'},
    description: 'Make user owner of the object',
    accessType: 'EXECUTE',
    accepts: [
      {arg: 'id', type: 'string', description: 'User Id', required: true},
      {arg: 'objectId', type: 'string', description: 'Object Id', required: true}
    ],
    returns: {root: true}
  });

  User.remoteMethod('getObjects', {
    http: {verb: 'get', path: '/:id/objects'},
    description: 'Get objects which user own',
    accessType: 'EXECUTE',
    accepts: {arg: 'id', type: 'string', description: 'User Id', required: true},
    returns: {root: true}
  });

  function addObject(id, objectId) {
    let userId = App.getCurrentUserId();
    let isSales;
    let isOwner;
    let promises = [];
    promises.push(App.isSales().then(value => isSales = value));
    promises.push(User.isOwner(userId, objectId).then(value => isOwner = value));
    return Promise.all(promises)
      .then(() => {
        if (!(isSales || isOwner)) throw ERRORS.forbidden('You are not owner of this object');
        let UserExtra = User.app.models.UserExtra;
        return UserExtra.addObject(id, objectId);
      });
  }

  function getObjects(id) {
    return User.getExtra(id)
      .then(extra => _.get(extra, 'objects', []))
  }

  function isOwner(userId, objectId) {
    return User.getObjects(userId)
      .then(objs => objs.includes(objectId));
  }
}
