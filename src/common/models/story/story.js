import {setCurrentUserId} from '../../behaviors/currentUser'
import {ignoreProperties} from '../../behaviors/ignoreProperties'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {App} from '../../services/App';
import {ERRORS} from '../../errors/errors';
import _ from 'lodash';

module.exports = (Story) => {
  Story.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted',
    DENIED: 'denied',
    ERASED: 'erased'
  };

  Story.STATUSES = _.values(Story.STATUS);

  Story.validatesInclusionOf('status', {in: Story.STATUSES});

  Story.MAX_TAGS = 3;
  Story.MIN_CONTENT_LENGTH = 1000;

  Story.disableRemoteMethod('createChangeStream', true);
  Story.disableRemoteMethod('upsert', true);
  Story.disableRemoteMethod('updateAll', true);
  Story.disableRemoteMethod('deleteById', true);

  Story.disableRemoteMethod('__get__user', false);
  Story.observe('before save', setCurrentUserId);
  Story.observe('before save', ignoreProperties({'status': {newDefault: Story.STATUS.ACTIVE}}));
  Story.observe('before save', Sanitize.observer('title', Sanitize.text));
  Story.observe('before save', Sanitize.observer('content', Sanitize.html));
  Story.observe('before save', Sanitize.alphaMinLengthObserver('content', Story.MIN_CONTENT_LENGTH));
  Story.observe('before save', Sanitize.observer('tags', tagSanitize));

  function tagSanitize(array) {
    let a = array.slice(0, Story.MAX_TAGS);
    a = a.map(s => s.toLocaleLowerCase());
    a = a.map(i => i.replace(/[^a-z0-9а-яё]/g, ''));
    //filter empty strings
    return a.filter(a => a)
  }

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
};
