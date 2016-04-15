import {setCurrentUserId} from '../../../behaviors/currentUser'
import {applyIdToType} from '../../../behaviors/idToType'
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../../behaviors/propertiesHelper'
import {initGet} from './get/get';
import _ from 'lodash'

module.exports = (ManageRequest) => {
  ManageRequest.commonInit(ManageRequest);
  applyIdToType(ManageRequest);

  ManageRequest.STATUS = {
    ACTIVE: 'active',
    APPROVED: 'approved',
    DELETED: 'deleted'
  };

  ManageRequest.STATUSES = _.values(ManageRequest.STATUS);

  ManageRequest.validatesInclusionOf('status', {in: ManageRequest.STATUSES});

  ManageRequest.disableAllRemotesExcept(ManageRequest, ['create']);
  ManageRequest.disableRemoteMethod('__get__subject', false);
  ManageRequest.disableRemoteMethod('__get__user', false);

  ManageRequest.observe('before save', setCurrentUserId);
  initGet(ManageRequest);
};
