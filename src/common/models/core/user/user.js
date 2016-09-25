import {coModel} from '../../../../server/extend/framework.js';
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
import {disableAllRemotesExcept, disableRemoteScope} from '../common.js';

module.exports = (User) => {
  coModel(User);
  User.observe('before save', timestampBehavior);
  applyIdToType(User);
  User.findByIdRequired = findByIdRequired;

  disableAllRemotesExcept(User, ['find', 'findById', 'updateAttributes', 'count', 'exists', 'create']);
  disableRemoteScope(User, 'accessTokens', false);
  disableRemoteScope(User, 'identities', false);

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
