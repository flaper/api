import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';

export function initStatusActions(Poll) {
  Poll.actionDeny = actionDeny;
  Poll.actionDelete = actionDelete;
  Poll.actionActivate = actionActivate;
  Poll.actionClose = actionClose;

  Poll.remoteMethod(
    'actionDeny',
    {
      description: `Set '${Poll.STATUS.DENIED}' status for a Poll`,
      http: {path: '/:id/status/deny', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Poll.remoteMethod(
    'actionDelete',
    {
      description: `Set '${Poll.STATUS.DELETED}' status for a Poll`,
      http: {path: '/:id/status/delete', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Poll.remoteMethod(
    'actionActivate',
    {
      description: `Set '${Poll.STATUS.ACTIVE}' status for denied Poll`,
      http: {path: '/:id/status/activate', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Poll.remoteMethod(
    'actionClose',
    {
      description: `Set '${Poll.STATUS.CLOSED}' status for active Poll`,
      http: {path: '/:id/status/close', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  function* actionDeny(id) {
    //admin only can call this
    let Poll = yield (Poll.findByIdRequired(id));
    if (Poll.status !== Poll.STATUS.ACTIVE)
      throw ERRORS.forbidden('Only active stories can be denied');
    Poll.status = Poll.STATUS.DENIED;
    yield (Poll.save({skipIgnore: {status: true}}));
    return Poll;
  }

  function* actionClose(id) {
    //admin only can call this
    let Poll = yield (Poll.findByIdRequired(id));
    if (Poll.status !== Poll.STATUS.ACTIVE)
      throw ERRORS.forbidden('Only active stories can be closed');
    Poll.status = Poll.STATUS.CLOSED;
    yield (Poll.save({skipIgnore: {status: true}}));
    return Poll;
  }

  // to improve - should be no ACL check in action
  function* actionDelete(id) {
    // $owner and admin can only call this
    let userId = App.getCurrentUserId();
    // if not admin - it will be owner, because of ACL
    let isAdmin = yield App.isAdmin();
    let Poll = yield Poll.findByIdRequired(id);

    // admin can from DENIED status, and ACTIVE status for his stories
    // $owner can from ACTIVE / DENIED status,
    if ((isAdmin && !(Poll.status === Poll.STATUS.DENIED ||
      (Poll.userId.toString() === userId && Poll.status === Poll.STATUS.ACTIVE) )) ||
      (!isAdmin && ![Poll.STATUS.ACTIVE, Poll.STATUS.DENIED].includes(Poll.status))) {
      throw ERRORS.forbidden();
    }
    Poll.status = Poll.STATUS.DELETED;
    yield Poll.save({skipIgnore: {status: true}});
    return Poll;
  }

  function* actionActivate(id) {
    //admin only can call this
    let Poll = yield Poll.findByIdRequired(id);
    if (Poll.status !== Poll.STATUS.DENIED)
      throw ERRORS.forbidden('Only denied stories can be activated again');
    yield (Poll.notifyObserversOf('before activate', Poll));
    Poll.status = Poll.STATUS.ACTIVE;
    yield Poll.save({skipIgnore: {status: true}});
    return Poll;
  }

}
