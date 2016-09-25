import {App} from '../../../../services/App';
import {ERRORS} from '../../../../utils/errors';
import _ from 'lodash';

/**object owners*/
export function initObjects(User) {
  User.addObject = addObject;
  User.removeObject = removeObject;
  User.getObjectsIds = getObjectsIds;
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

  User.remoteMethod('removeObject', {
    http: {verb: 'delete', path: '/:id/objects'},
    description: 'Remove user from owner of the object',
    accessType: 'EXECUTE',
    accepts: [
      {arg: 'id', type: 'string', description: 'User Id', required: true},
      {arg: 'objectId', type: 'string', description: 'Object Id', required: true}
    ],
    returns: {root: true}
  });

  User.remoteMethod('getObjectsIds', {
    http: {verb: 'get', path: '/:id/objectsIds'},
    description: 'Get objects which user own',
    accessType: 'EXECUTE',
    accepts: {arg: 'id', type: 'string', description: 'User Id', required: true},
    returns: {root: true}
  });

  function addObject(id, objectId) {
    let userId = App.getCurrentUserId();
    return hasAccessForbidden(userId, objectId)
      .then(() => {
        let UserExtra = User.app.models.UserExtra;
        return UserExtra.addObject(id, objectId);
      });
  }

  function removeObject(id, objectId) {
    let userId = App.getCurrentUserId();
    return hasAccessForbidden(userId, objectId)
      .then(() => {
        let UserExtra = User.app.models.UserExtra;
        return UserExtra.removeObject(id, objectId);
      });
  }

  function* getObjectsIds(id) {
    let UserExtra = User.app.models.UserExtra;
    return yield (UserExtra.getObjectsIds(id));
  }

  function hasAccessForbidden(userId, objectId) {
    return hasAccess(userId, objectId)
      .then((hasAccess) => {
        if (!hasAccess) throw ERRORS.forbidden('You are not owner of this object');
        return true;
      });
  }

  function hasAccess(userId, objectId) {
    let isSales;
    let isOwner;
    let promises = [];
    promises.push(App.isSales().then(value => isSales = value));
    promises.push(User.isOwner(userId, objectId).then(value => isOwner = value));
    return Promise.all(promises)
      .then(() => isSales || isOwner)
  }

  function isOwner(userId, objectId) {
    return User.getObjectsIds(userId)
      .then(objs => objs.includes(objectId));
  }
}
