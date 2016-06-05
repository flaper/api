import {App} from '../../../../services/App';
import {ERRORS} from '../../../../utils/errors';
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

  function actionApprove(id) {
    return ManageRequest.findByIdRequired(id)
      .then((request) => {
        if (request.status === ManageRequest.STATUS.APPROVED) {
          throw ERRORS.badRequest('Already approved')
        }
        let User = ManageRequest.app.models.User;
        let UserExtra = ManageRequest.app.models.UserExtra;
        let promises = [];
        promises.push(User.addObject(request.userId, request.subjectId));
        let premiumExpire = moment().add(30, 'days').toDate();
        promises.push(User.updateExtraValueToLeast(request.userId, UserExtra.PROPERTIES.premiumSupport, premiumExpire));
        return Promise.all(promises);
      });
  }

  function actionDeny(id) {
    //only super can call this
    return ManageRequest.findByIdRequired(id)
      .then((request) => {
        if (request.status === ManageRequest.STATUS.ACTIVE) {
          request.status = ManageRequest.STATUS.DENIED;
          return request.save({skipIgnore: {status: true}})
        } else {
          throw ERRORS.forbidden('Only active requests can be denied');
        }
      });
  }

  function actionDelete(id) {
    //only $owner can call this
    return ManageRequest.findByIdRequired(id)
      .then((request) => {
        if (request.status === ManageRequest.STATUS.ACTIVE) {
          request.status = ManageRequest.STATUS.DELETED;
          return request.save({skipIgnore: {status: true}})
        } else {
          throw ERRORS.forbidden('Only active requests can be deleted');
        }
      });
  }
}
