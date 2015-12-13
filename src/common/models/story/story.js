import {setCurrentUserId} from '../../behaviors/currentUser'
import {Sanitize} from '../../../libs/sanitize/Sanitize';

module.exports = (Story) => {
  Story.STATUSES = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };

  Story.MAX_TAGS = 3;

  Story.disableRemoteMethod('createChangeStream', true);
  Story.disableRemoteMethod('upsert', true);
  Story.disableRemoteMethod('updateAll', true);
  Story.disableRemoteMethod('deleteById', true);

  Story.disableRemoteMethod('__get__user', false);
  Story.observe('before save', setCurrentUserId);
  Story.observe('before save', Sanitize.observer('title', Sanitize.text));
  Story.observe('before save', Sanitize.observer('content', Sanitize.html));
  Story.observe('before save', Sanitize.observer('tags', tagSanitize));


  function tagSanitize(array) {
    let a = array.slice(0, Story.MAX_TAGS);
    a = a.map(s => s.toLocaleLowerCase());
    a = a.map(i => i.replace(/[^a-z0-9а-яё]/g, ''));
    //filter empty strings
    return a.filter(a => a)
  }
};
