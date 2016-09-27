import {App} from '../../../../services/App.js';
import {ERRORS} from '../../../../utils/errors.js';
import moment from 'moment';

export function initStatusActions(ManageRequest) {
  ManageRequest.actionApprove = actionApprove;
  ManageRequest.actionDeny = actionDeny;
  ManageRequest.actionDelete = actionDelete;

  ManageRequest.remoteMethod(
    'actionApprove',
    {
      description: `Set '${ManageRequest.STATUS.APPROVED}' status`,
      http: {path: '/:id/status/approve', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );
  ManageRequest.remoteMethod(
    'actionDeny',
    {
      description: `Set '${ManageRequest.STATUS.DENIED}' status`,
      http: {path: '/:id/status/deny', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  ManageRequest.remoteMethod(
    'actionDelete',
    {
      description: `Set '${ManageRequest.STATUS.DELETED}' status`,
      http: {path: '/:id/status/delete', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  function* actionApprove(id) {
    let request = yield (ManageRequest.findByIdRequired(id));
    if (request.status === ManageRequest.STATUS.APPROVED)
      throw ERRORS.badRequest('Уже одобрен');
    let {User, UserExtra} = ManageRequest.app.models;
    let promises = [];
    promises.push(User.addObject(request.userId, request.subjectId));
    let premiumExpire = moment().add(30, 'days').toDate();
    promises.push(User.updateExtraValueToLeast(request.userId, UserExtra.PROPERTIES.premiumSupport, premiumExpire));
    request.status = ManageRequest.STATUS.APPROVED;
    promises.push(request.save({skipIgnore: {status: true}}));
    return yield (promises);
  }

  function* actionDeny(id) {
    // only super can call this
    let request = yield (ManageRequest.findByIdRequired(id));
    if (request.status !== ManageRequest.STATUS.ACTIVE) 
      throw ERRORS.forbidden('Only active requests can be denied');
    request.status = ManageRequest.STATUS.DENIED;
    return yield (request.save({skipIgnore: {status: true}}));
  }

  function* actionDelete(id) {
    // only $owner can call this
    let request = yield (ManageRequest.findByIdRequired(id));
    if (request.status !== ManageRequest.STATUS.ACTIVE)
      throw ERRORS.forbidden('Only active requests can be deleted');
    request.status = ManageRequest.STATUS.DELETED;
    return yield (request.save({skipIgnore: {status: true}}));
  }
}
