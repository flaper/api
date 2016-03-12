import {setCurrentUserId} from '../../behaviors/currentUser'
import {applyIdToType} from '../../behaviors/idToType'
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../behaviors/propertiesHelper'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {FlaperMark} from '../../../libs/markdown/markdown'
import {initStatusActions} from './status/status';
import {initGet} from './get/get';
import _ from 'lodash';

module.exports = (Story) => {
  Story.commonInit(Story);
  applyIdToType(Story);

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

  Story.disableRemoteMethod('deleteById', true);

  Story.disableRemoteMethod('__get__user', false);

  Story.observe('before save', ignoreUpdatedIfNoChanges(['title', 'content']));
  Story.observe('before save', setCurrentUserId);
  Story.observe('before save', ignoreProperties({
    status: {newDefault: Story.STATUS.ACTIVE},
    contentHTML: {},
    views: {},
    viewsRecent: {}
  }));
  Story.observe('before save', Sanitize.observer('title', Sanitize.text));
  Story.observe('before save', contentObserver);
  Story.observe('before save', Sanitize.alphaMinLengthObserver('content', Story.MIN_CONTENT_LENGTH));
  Story.observe('before save', Sanitize.observer('tags', tagSanitize));

  let sanitizeContent = Sanitize.observer('content', Sanitize.html);

  function contentObserver(ctx) {
    return sanitizeContent(ctx)
      .then((value) => {
        if (value) {
          let html = FlaperMark.toHTML(value);

          setProperty(ctx, 'contentHTML', html);
        }
      })
  }

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
