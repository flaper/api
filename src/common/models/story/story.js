import {setCurrentUserId} from '../../behaviors/currentUser'
import {Sanitize} from '../../../libs/sanitize/Sanitize';

module.exports = (Story) => {
  Story.STATUSES = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };

  Story.disableRemoteMethod('createChangeStream', true);
  Story.disableRemoteMethod('upsert', true);
  Story.disableRemoteMethod('updateAll', true);
  Story.disableRemoteMethod('deleteById', true);

  Story.disableRemoteMethod('__get__user', false);
  Story.observe('before save', setCurrentUserId);
  Story.observe('before save', sanitize);

  function sanitize(ctx) {
    if (ctx.instance) {
      //this is adding (POST)
      Sanitize.oText(ctx.instance, 'title');
      Sanitize.oHtml(ctx.instance, 'content');
    } else {
      Sanitize.oText(ctx.data, 'title');
      Sanitize.oHtml(ctx.data, 'content');
    }
    return Promise.resolve();
  }
};
