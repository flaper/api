import {setCurrentUserId} from '../../behaviors/currentUser'
import {ignoreProperties} from '../../behaviors/ignoreProperties'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {initStatusActions} from './status/status';
import {initGet} from './get/get';
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

  Story.findByIdRequired = (id) => {
    return Story.findById(id)
      .then((story) => {
        if (!story) {
          throw ERRORS.notFound(`Story with id ${id} not found`);
        }
        return story;
      });
  };

  Story.disableRemoteMethod('createChangeStream', true);
  Story.disableRemoteMethod('upsert', true);
  Story.disableRemoteMethod('updateAll', true);
  Story.disableRemoteMethod('deleteById', true);
  Story.disableRemoteMethod('findOne', true);
  Story.disableRemoteMethod('find', true);
  Story.disableRemoteMethod('__get__scopePublic', true);
  Story.disableRemoteMethod('__create__scopePublic', true);
  Story.disableRemoteMethod('__delete__scopePublic', true);
  Story.disableRemoteMethod('__count__scopePublic', true);

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

  initStatusActions(Story);
  initGet(Story);

};
