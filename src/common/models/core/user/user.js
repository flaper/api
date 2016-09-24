import {timestampBehavior} from '../../../behaviors/timestamps.js';
import {applyIdToType} from '../../../behaviors/idToType';
import {findByIdRequired} from '../methods/findMethods';
import {ignoreProperties} from '../../../behaviors/propertiesHelper';
import {initIdentities} from './identities/identities';
import {initRoles} from './roles/roles';
import {initPhotos} from './photo/photo';
import {initSettings} from './settings/settings';
import {initExtra} from './extra/extra';
import {initObjects} from './objects/objects';
import {initSubscriptions} from './subscriptions/subscriptions';
import {disableAllRemotesExcept} from '../common.js';

module.exports = (User) => {
  User.observe('before save', timestampBehavior);
  applyIdToType(User);
  User.findByIdRequired = findByIdRequired;

  disableAllRemotesExcept(User, ['find', 'findById', 'updateAttributes', 'count', 'exists', 'create']);

  User.disableRemoteMethod('__count__accessTokens', false);
  User.disableRemoteMethod('__create__accessTokens', false);
  User.disableRemoteMethod('__delete__accessTokens', false);
  User.disableRemoteMethod('__destroyById__accessTokens', false);
  User.disableRemoteMethod('__findById__accessTokens', false);
  User.disableRemoteMethod('__get__accessTokens', false);
  User.disableRemoteMethod('__updateById__accessTokens', false);

  User.disableRemoteMethod('__count__identities', false);
  User.disableRemoteMethod('__create__identities', false);
  User.disableRemoteMethod('__delete__identities', false);
  User.disableRemoteMethod('__destroyById__identities', false);
  User.disableRemoteMethod('__findById__identities', false);
  User.disableRemoteMethod('__get__identities', false);
  User.disableRemoteMethod('__updateById__identities', false);

  User.observe('before save', ignoreProperties({
    commentsNumber: {newDefault: 0},
    likesNumber: {newDefault: 0}
  }));

  initIdentities(User);
  initRoles(User);
  initPhotos(User);
  initSettings(User);
  initExtra(User);
  initObjects(User);
  initSubscriptions(User);
};
