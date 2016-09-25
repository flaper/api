import {App} from '../../../../services/App.js';
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
    description: 'Список объектов, которыми управляет пользователь',
    accessType: 'EXECUTE',
    accepts: {arg: 'id', type: 'string', description: 'User Id', required: true},
    returns: {root: true}
  });

  function* addObject(id, objectId) {
    let userId = App.getCurrentUserId();
    yield (hasAccessForbidden(userId, objectId));
    let UserExtra = User.app.models.UserExtra;
    return yield (UserExtra.addObject(id, objectId));
  }

  function* removeObject(id, objectId) {
    let userId = App.getCurrentUserId();
    yield (hasAccessForbidden(userId, objectId));
    let UserExtra = User.app.models.UserExtra;
    return yield (UserExtra.removeObject(id, objectId));
  }

  function* getObjectsIds(id) {
    console.log('method');
    let UserExtra = User.app.models.UserExtra;
    return yield (UserExtra.getObjectsIds(id));
  }

  function* hasAccessForbidden(userId, objectId) {
    let access = yield (hasAccess(userId, objectId));
    if (!access)
      throw ERRORS.forbidden('You are not owner of this object');
    return true;
  }

  function* hasAccess(userId, objectId) {
    // isSales первый, пока не обновлен getCurrentContext
    let isSales = yield (App.isSales());
    if (isSales)
      return true;
    return yield (User.isOwner(userId, objectId));
  }

  function* isOwner(userId, objectId) {
    let ids = yield (User.getObjectsIds(userId));
    return ids.includes(objectId);
  }
}
