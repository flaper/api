import {timestampBehavior} from '../../../behaviors/timestamps.js';
import {applyIdToType} from '../../../behaviors/idToType'
import {findByIdRequired} from '../methods/findMethods'
import {initRoles} from './roles/roles'
import {initPhotos} from './photo/photo'
import {initSettings} from './settings/settings'

module.exports = (User) => {
  User.observe('before save', timestampBehavior);
  applyIdToType(User);
  User.findByIdRequired = findByIdRequired;

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

  initRoles(User);
  initPhotos(User);
  initSettings(User);
};
