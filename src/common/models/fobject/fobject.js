import {applyIdToType} from '../../behaviors/idToType'
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../behaviors/propertiesHelper'
import {initGet} from './get/get';
import {initSlug} from './slug/slug';
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

  FObject.observe('before save', domainObserver);
  FObject.observe('before save', regionObserver);

  initGet(FObject);
  initSlug(FObject);
  initFlapSync(FObject);

  function domainObserver(ctx) {
    if (ctx.instance && ctx.isNewInstance) {
      ctx.instance.mainDomain = ctx.instance.mainDomain.toLocaleLowerCase();
    }
    return Promise.resolve();
  }

  function regionObserver(ctx) {
    if (ctx.instance && ctx.isNewInstance && ctx.instance.mainDomain === FObject.DOMAINS.PLACES) {
      if (!ctx.instance.region) {
        ctx.instance.region = "";
      } else {
        ctx.instance.region = ctx.instance.region.toLocaleLowerCase();
      }
    }
    return Promise.resolve();
  }
};
