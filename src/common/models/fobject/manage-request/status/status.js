import {App} from '../../../../services/App';
import {ERRORS} from '../../../../utils/errors';

export function initStatusActions(ManageRequest) {
  ManageRequest.actionDeny = actionDeny;
  ManageRequest.actionDelete = actionDelete;

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
