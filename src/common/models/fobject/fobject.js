import {applyIdToType} from '../../behaviors/idToType'
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../behaviors/propertiesHelper'
import {initGet} from './get/get';
import {initFlapSync} from './flap/sync';
import _ from 'lodash';

module.exports = (FObject) => {
  FObject.commonInit(FObject);
  applyIdToType(FObject);

  FObject.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };

  FObject.DOMAINS = {
    PLACES: 'места'
  };

  FObject.STATUSES = _.values(FObject.STATUS);

  FObject.validatesInclusionOf('status', {in: FObject.STATUSES});

  FObject.disableAllRemotesExcept(FObject, ['find', 'findById', 'count', 'exists']);
  initGet(FObject);
  initFlapSync(FObject);
};
