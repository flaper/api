import {timestampBehavior} from '../../behaviors/timestamps.js';
import {RoleService} from '../../services/roleService';

module.exports = (User) => {
  User.observe('before save', timestampBehavior);
  User.disableRemoteMethod('createChangeStream', true);
  User.disableRemoteMethod('deleteById', true);
  User.disableRemoteMethod('updateAll', true);
  User.disableRemoteMethod('upsert', true);

  User.disableRemoteMethod('__count__accessTokens', false);
  User.disableRemoteMethod('__create__accessTokens', false);
  User.disableRemoteMethod('__delete__accessTokens', false);
  User.disableRemoteMethod('__destroyById__accessTokens', false);
  User.disableRemoteMethod('__findById__accessTokens', false);
  User.disableRemoteMethod('__get__accessTokens', false);
  User.disableRemoteMethod('__updateById__accessTokens', false);

  User.disableRemoteMethod('__create__roles', false);
  User.disableRemoteMethod('__link__roles', false);
  User.disableRemoteMethod('__unlink__roles', false);
  User.disableRemoteMethod('__exists__roles', false);
  User.disableRemoteMethod('__destroyById__roles', false);
  User.disableRemoteMethod('__findById__roles', false);
  User.disableRemoteMethod('__updateById__roles', false);

  User.afterRemote('*.__delete__roles', function (ctx, inst, next) {
    //we need to refresh our cash
    RoleService.updateVariables();
    next();
  });

  User.setRole = setRole;
  function setRole(id, role) {
    return RoleService.setRole(id, role);
  }

  User.remoteMethod(
    'setRole',
    {
      description: 'Set role for a user',
      http: {path: '/:id/roles', verb: 'post'},
      accepts: [
        {arg: 'id', type: 'string', required: true},
        {arg: 'role', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );
};
