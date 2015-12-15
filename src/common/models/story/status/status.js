import {App} from '../../../services/App';
import {ERRORS} from '../../../errors/errors';

export function initStatusActions(Story) {
  Story.actionDelete = actionDelete;
  function actionDelete(id) {
    //$owner and admin can only call this
    //$owner can from ACTIVE / DENIED status, admin can from DENIED status
    let promises = [];
    let story = null;
    let isAdmin;//if not admin - it will be owner, because of ACL
    promises.push(Story.findById(id)
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
}
