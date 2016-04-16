import {setCurrentUserId} from '../../../behaviors/currentUser'
import {applyIdToType} from '../../../behaviors/idToType'
import {ignoreProperties} from '../../../behaviors/propertiesHelper'
import {initGet} from './get/get';
import {initCreate} from './create/create';
import {initStatusActions} from './status/status';
import _ from 'lodash'

module.exports = (ManageRequest) => {
  ManageRequest.commonInit(ManageRequest);
  applyIdToType(ManageRequest);

  ManageRequest.STATUS = {
    ACTIVE: 'active',
    APPROVED: 'approved',
    DENIED: 'denied',
    DELETED: 'deleted'
  };

  ManageRequest.STATUSES = _.values(ManageRequest.STATUS);

  ManageRequest.validatesInclusionOf('status', {in: ManageRequest.STATUSES});

  ManageRequest.disableAllRemotesExcept(ManageRequest);
  ManageRequest.disableRemoteMethod('__get__subject', false);
  ManageRequest.disableRemoteMethod('__get__user', false);

  ManageRequest.observe('before save', ignoreProperties({
    status: {newDefault: ManageRequest.STATUS.ACTIVE}
  }));

  ManageRequest.observe('before save', setCurrentUserId);
  initGet(ManageRequest);
  initCreate(ManageRequest);
  initStatusActions(ManageRequest);
};
