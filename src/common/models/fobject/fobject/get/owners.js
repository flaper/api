import {App} from '../../../../services/App.js';
import {OBJECT_PERMISSIONS} from '@flaper/consts';

export function initOwners(FObject) {
  FObject.getPermissions = getPermissions;
  FObject.getOwners = getOwners;
  FObject.iGetPermissions = iGetPermissions;

  FObject.remoteMethod(
    'getPermissions',
    {
      http: {path: '/:id/permissions', verb: 'get'},
      description: `Список прав для выбранного объекта`,
      accessType: 'READ',
      accepts: {
        arg: 'id', type: 'string', description: 'ID объекта'
      },
      returns: {root: true}
    }
  );

  FObject.remoteMethod(
    'getOwners',
    {
      http: {path: '/:id/owners', verb: 'get'},
      description: `Список владельцев объекта`,
      accessType: 'READ',
      accepts: {
        arg: 'id', type: 'string', description: 'ID объекта'
      },
      returns: {root: true}
    }
  );


  function* getPermissions(objectId) {
    let userId = App.getCurrentUserId();
    return yield iGetPermissions(objectId, userId);
  }

  function* iGetPermissions(objectId, userId) {
    if (!userId)
      return [];
    const {User} = FObject.app.models;
    let isOwner = yield (User.isOwner(userId, objectId));
    const P = OBJECT_PERMISSIONS;
    if (!isOwner)
      return [P.INFO_CHANGE];
    return [P.OWNER, P.LOGO, P.ANSWER, P.INFO_CHANGE, P.IMAGE_UPLOAD, P.IMAGE_REMOVE, P.OWNERS_ADD, P.OWNERS_REMOVE];
  }

  function * getOwners(objectId) {
    const {UserExtra} = FObject.app.models;
    let users = yield (UserExtra.find({where: {objects: objectId}}));
    return users.map(user=>user.userId);
  }
}
