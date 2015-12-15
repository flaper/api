import {App} from '../../../services/App';
import {ERRORS} from '../../../errors/errors';

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
  function requireStory(story) {
    if (!story) {
      throw ERRORS.notFound('Story with such id not found');
    }
  }

  function actionDeny(id) {
    //admin only can call this
    return Story.findByIdRequired(id)
      .then((story) => {
        if (story.status === Story.STATUS.ACTIVE) {
          story.status = Story.STATUS.DENIED;
          return story.save({skipIgnore: {status: true}});
        } else {
          throw ERRORS.forbidden('Only active stories can be denied');
        }
      });
  }

  function actionDelete(id) {
    //$owner and admin can only call this
    //$owner can from ACTIVE / DENIED status, admin can from DENIED status
    let promises = [];
    let story = null;
    let isAdmin;//if not admin - it will be owner, because of ACL
    promises.push(Story.findByIdRequired(id)
      .then(s => story = s));
    promises.push(App.isAdmin().then(res => isAdmin = res));
    return Promise.all(promises)
      .then(() => {
        if ((isAdmin && story.status === Story.STATUS.DENIED) ||
          (!isAdmin && ([Story.STATUS.ACTIVE, Story.STATUS.DENIED].indexOf(story.status) > -1) )) {
          story.status = Story.STATUS.DELETED;
          return story.save({skipIgnore: {status: true}});
        } else {
          throw ERRORS.forbidden();
        }
      })
  }

  function actionActivate(id) {
    //admin only can call this
    return Story.findByIdRequired(id)
      .then((story) => {
        console.log('inside activate');
        console.log(story);
        if (story.status === Story.STATUS.DENIED) {
          story.status = Story.STATUS.ACTIVE;
          return story.save({skipIgnore: {status: true}});
        } else {
          throw ERRORS.forbidden('Only denied stories can be activated again');
        }
      });
  }

}
