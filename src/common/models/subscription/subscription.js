import {App} from '../../services/App';
import {ignoreProperties} from '../../behaviors/propertiesHelper'
import {ERRORS} from '../../utils/errors';
import {propertiesFilter} from '../../utils/object';

import _ from 'lodash';

module.exports = (Subscription) => {
  const ALLOWED_MODELS = ['user','FObject'];
  const MAX_SUBSCRIPTIONS_PER_DAY = 10;
  Subscription.commonInit(Subscription);
  Subscription.disableAllRemotesExcept(Subscription, ['count', 'find']);

  Subscription.disableRemoteMethod('__get__subject', false);
  Subscription.disableRemoteMethod('__get__user', false);


  Subscription.RETURN_STATUS = {
    CREATED: 'created',
    DELETED: 'deleted'
  };

  Subscription.iSyncSubject = function* (subjectType, id) {
    // let Model = Subscription;
    let count = Subscription.count({targetId: id});
    yield (Subscription.updateAll({id: id}, {SubscriptionsNumber: count}, {skipIgnore: {SubscriptionsNumber: true}}));
    return count;
  };

  Subscription.actionToggle = actionToggle;
  Subscription.actionCreate = actionCreate;
  Subscription.actionDelete = actionDelete;

  Subscription.remoteMethod(
    'actionToggle',
    {
      description: `Toggle Subscription for subject`,
      http: {path: '/toggle/:targetId', verb: 'post'},
      accepts: [
        {arg: 'targetId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Subscription.remoteMethod(
    'actionCreate',
    {
      description: `Create a Subscription for subject`,
      http: {path: '/:targetId', verb: 'post'},
      accepts: [
        {arg: 'targetId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Subscription.remoteMethod(
    'actionDelete',
    {
      description: `Delete a Subscription for subject`,
      http: {path: '/:targetId', verb: 'delete'},
      accepts: [
        {arg: 'targetId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  function* actionToggle(targetId) {
    //userId should exist
    let userId = App.getCurrentUserId();
    //findOne works without implicit and
    let sub = yield (Subscription.findOne({where: {targetId, userId}}));

    return sub ? yield (actionInternalDelete(targetId,userId)) : yield (actionInternalCreate(targetId,userId));
  }

  function * actionCreate(targetId) {
    //userId should exist
    let userId = App.getCurrentUserId();
    //findOne works without implicit and
    let sub = yield (Subscription.findOne({where: {targetId, userId}}));
    if (sub) {
      throw ERRORS.badRequest('Subscription already exists.');
    }
    return yield (actionInternalCreate(targetId, userId));
  }

  function * actionInternalCreate(targetId, userId) {
    let IdToType = Subscription.app.models.IdToType,
        idToType = yield (IdToType.findByIdRequired(targetId)),
        restrictSpan = Date.now() - (24*60*60*1000),
        recentSubscriptionsCount =yield (Subscription.count({userId:userId,created:{gte:restrictSpan}})),
        subjectType = idToType.type;
    if (recentSubscriptionsCount > MAX_SUBSCRIPTIONS_PER_DAY) {
      throw ERRORS.forbidden(`Only ${MAX_SUBSCRIPTIONS_PER_DAY} subscriptions allowed per day`);
    }
    if (!ALLOWED_MODELS.includes(subjectType)) {
      throw ERRORS.badRequest(`Subscriptions are not allowed for type '${subjectType}'.`)
    }
    if (targetId.toString() === userId.toString()) {
      throw ERRORS.badRequest('Can not subscribe to yourself');
    }
    yield (Subscription.create({targetId, userId,subjectType}));
    let count = yield (Subscription.iSyncSubject(subjectType, targetId));
    return {
      status: Subscription.RETURN_STATUS.CREATED,
      count: count
    };
  }

  function * actionDelete(targetId) {
    //userId should exist
    let userId = App.getCurrentUserId();
    //findOne works without implicit and
    let sub = yield (Subscription.findOne({where: {targetId, userId}}));
    if (!sub) throw  ERRORS.notFound('No such Subscription');
    return yield (actionInternalDelete(targetId, userId));
  }

  function * actionInternalDelete(targetId, userId) {
    let IdToType = Subscription.app.models.IdToType;

    //delete works without implicit and
    yield (Subscription.deleteAll({targetId, userId}));
    let idToType = yield (IdToType.findByIdRequired(targetId));
    let count = yield (Subscription.iSyncSubject(idToType.type, targetId));
    return {
      status: Subscription.RETURN_STATUS.DELETED,
      count: count
    }
  }
};
