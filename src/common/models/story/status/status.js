import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';

export function initStatusActions(Story) {
  Story.actionDeny = actionDeny;
  Story.actionDelete = actionDelete;
  Story.actionActivate = actionActivate;

  Story.remoteMethod(
    'actionDeny',
    {
      description: `Set '${Story.STATUS.DENIED}' status for a Story`,
      http: {path: '/:id/status/deny', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Story.remoteMethod(
    'actionDelete',
    {
      description: `Set '${Story.STATUS.DELETED}' status for a Story`,
      http: {path: '/:id/status/delete', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Story.remoteMethod(
    'actionActivate',
    {
      description: `Set '${Story.STATUS.ACTIVE}' status for denied Story`,
      http: {path: '/:id/status/activate', verb: 'put'},
      accepts: [
        {arg: 'id', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  function actionDeny(id) {
    //admin only can call this
    let story;
    return Story.findByIdRequired(id)
      .then((s) => {
        story = s;
        if (story.status === Story.STATUS.ACTIVE) {
          story.status = Story.STATUS.DENIED;
          return story.save({skipIgnore: {status: true}})
        } else {
          throw ERRORS.forbidden('Only active stories can be denied');
        }
      })
      .then((response) => {
        Story.iSyncUser(story.userId);
        return response;
      })
  }

  // to improve - should be no ACL check in action
  function* actionDelete(id) {
    // $owner and admin can only call this
    let userId = App.getCurrentUserId().toString();
    // if not admin - it will be owner, because of ACL
    let isAdmin = yield (App.isAdmin());
    let story = yield (Story.findByIdRequired(id));

    // admin can from DENIED status, and ACTIVE status for his stories
    // $owner can from ACTIVE / DENIED status,
    if ((isAdmin && !(story.status === Story.STATUS.DENIED || 
	   (story.userId.toString() === userId && story.status === Story.STATUS.ACTIVE) )) ||
	 (!isAdmin && ![Story.STATUS.ACTIVE, Story.STATUS.DENIED].includes(story.status)) ) 
    {
      throw ERRORS.forbidden();
    }
    story.status = Story.STATUS.DELETED;
    yield (story.save({skipIgnore: {status: true}}));
    // we don't wait to iSyncUser to finish
    Story.iSyncUser(story.userId);
    return story;
  }

  function actionActivate(id) {
    //admin only can call this
    let story;
    return Story.findByIdRequired(id)
      .then((s) => {
        story = s;
        if (story.status === Story.STATUS.DENIED) {
          return Story.notifyObserversOf('before activate', story);
        } else {
          throw ERRORS.forbidden('Only denied stories can be activated again');
        }
      })
      .then(() => {
        story.status = Story.STATUS.ACTIVE;
        return story.save({skipIgnore: {status: true}});
      })
      .then((response) => {
        Story.iSyncUser(story.userId);
        return response;
      })
  }

}
