import {timestampBehavior} from '../../behaviors/timestamps.js';
import {RoleService} from '../../services/roleService';

module.exports = (Role) => {
  Role.disableRemoteMethod('createChangeStream', true);
  Role.disableRemoteMethod('deleteById', true);
  Role.disableRemoteMethod('updateAll', true);
  Role.disableRemoteMethod('upsert', true);
  Role.disableRemoteMethod('exists', true);
  Role.disableRemoteMethod('findById', true);
  Role.disableRemoteMethod('create', true);
  Role.disableRemoteMethod('count', true);
  Role.disableRemoteMethod('findOne', true);
  Role.disableRemoteMethod('updateAttributes', false);

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
