import {RoleService} from '../../services/roleService.js';
import {disableAllRemotesExcept, disableRemoteScope} from '../core/common.js';

module.exports = (Role) => {
  disableAllRemotesExcept(Role, ['find']);
  disableRemoteScope(Role, 'principals', false);
};
