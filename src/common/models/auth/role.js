import {RoleService} from '../../services/roleService.js';
import {disableAllRemotesExcept} from '../core/common.js';

module.exports = (Role) => {
  disableAllRemotesExcept(Role, ['find']);

  Role.disableRemoteMethod('__create__principals', false);
  Role.disableRemoteMethod('__link__principals', false);
  Role.disableRemoteMethod('__unlink__principals', false);
  Role.disableRemoteMethod('__destroyById__principals', false);
  Role.disableRemoteMethod('__findById__principals', false);
  Role.disableRemoteMethod('__updateById__principals', false);
  Role.disableRemoteMethod('__get__principals', false);
  Role.disableRemoteMethod('__delete__principals', false);
  Role.disableRemoteMethod('__count__principals', false);
};
