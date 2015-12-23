import {RoleService} from '../../../../services/roleService';

export function initRoles(User) {
  User.disableRemoteMethod('__create__roles', false);
  User.disableRemoteMethod('__link__roles', false);
  User.disableRemoteMethod('__unlink__roles', false);
  User.disableRemoteMethod('__exists__roles', false);
  User.disableRemoteMethod('__destroyById__roles', false);
  User.disableRemoteMethod('__findById__roles', false);
  User.disableRemoteMethod('__updateById__roles', false);
  User.disableRemoteMethod('__get__roles', false);

  User.afterRemote('*.__delete__roles', function (ctx, inst, next) {
    //we need to refresh our cash
    RoleService.updateVariables();
    next();
  });

  User.getRoles = getRoles;

  function getRoles(id) {
    let RoleMapping = User.app.models['RoleMapping'];
    return User.findByIdRequired(id)
      .then((user) => RoleMapping.find({where: {principalId: user.id}}))
      .then((mappings) => mappings.map(roleMapping => RoleService.getRoleNameById(roleMapping.roleId)))
  }

  User.remoteMethod(
    'getRoles',
    {
      description: 'Get roles for a user',
      http: {path: '/:id/roles', verb: 'get'},
      accepts: [
        {arg: 'id', type: 'string', required: true},
      ],
      returns: {root: true}
    }
  );

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
}
