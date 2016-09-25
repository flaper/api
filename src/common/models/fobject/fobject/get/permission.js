import {App} from '../../../../services/App.js';
import {OBJECT_PERMISSIONS} from '@flaper/consts';

export function initPermissions(FObject) {
  FObject.getPermissions = getPermissions;

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

  function* getPermissions(objectId) {
    let userId = App.getCurrentUserId();
    if (!userId)
      return [];
    const {User} = FObject.app.models;
    let isOwner = yield (User.isOwner(userId, objectId));
    const P = OBJECT_PERMISSIONS;
    if (!isOwner)
      return [P.INFO_CHANGE];
    return [P.OWNER, P.LOGO, P.ANSWER, P.INFO_CHANGE, P.IMAGE_UPLOAD, P.IMAGE_REMOVE, P.OWNERS_ADD, P.OWNERS_REMOVE];
  }
}
