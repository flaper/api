import {setCurrentUserId} from '../../behaviors/currentUser'
import {applyIdToType} from '../../behaviors/idToType'
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../behaviors/propertiesHelper'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {FlaperMark} from '../../../libs/markdown/markdown'
import {initStatusActions} from './status/status';
import {initGet} from './get/get';
import {initSyncUser} from './methods/syncUser';
import {initDelete} from './methods/internalDelete';
import {ERRORS} from '../../utils/errors';
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
  Story.TYPE = {
    ARTICLE: 'article',
    REVIEW: 'review'
  };
  Story.STATUSES = _.values(Story.STATUS);
  Story.TYPES = _.values(Story.TYPE);

  Story.validatesInclusionOf('status', {in: Story.STATUSES});
  Story.validatesInclusionOf('type', {in: Story.TYPES});

  Story.MAX_TAGS = 3;
  Story.MIN_LENGTH = {
    article: 1000,
    review: 256
  };

  Story.disableRemoteMethod('deleteById', true);

  Story.disableRemoteMethod('__get__user', false);

  Story.observe('before save', ignoreUpdatedIfNoChanges(['title', 'content']));
  Story.observe('before save', setCurrentUserId);
  Story.observe('before save', ignoreProperties({
    status: {newDefault: Story.STATUS.ACTIVE},
    contentHTML: {},
    shortInline: {},
    shortText: {},
    views: {},
    viewsRecent: {},
    lastActive: {newDefault: (data) => data.created},
    commentsNumber: {newDefault: 0}
  }));
  Story.observe('before save', Sanitize.observer('title', Sanitize.text));
  Story.observe('before save', contentObserver);
  Story.observe('before save', minLengthObserver);
  Story.observe('before save', Sanitize.observer('tags', tagSanitize));
  Story.observe('before save', reviewObserver);

  initSyncUser(Story);
  initStatusActions(Story);
  initGet(Story);
  initDelete(Story);

  function minLengthObserver(ctx) {
    let type = ctx.instance ? ctx.instance.type : _.get(ctx, 'currentInstance.type');
    if (!type) {
      if (ctx.data) delete ctx.data.content;
      // e.g. just updating comments number
      return Promise.resolve();
    }
    let observer = Sanitize.alphaMinLengthObserver('content', Story.MIN_LENGTH[type]);
    return observer(ctx);
  }

  function contentObserver(ctx) {
    let sanitizeContent = Sanitize.observer('content', Sanitize.html);

    return sanitizeContent(ctx)
      .then((value) => {
        if (value) {
          let html = FlaperMark.toHTML(value);
          let shortInline = FlaperMark.shortInline(value);
          let shortText = Sanitize.text(shortInline);

          setProperty(ctx, 'contentHTML', html);
          setProperty(ctx, 'shortInline', shortInline);
          setProperty(ctx, 'shortText', shortText);
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

  function reviewObserver(ctx) {
    return new Promise((resolve, reject)=> {
      if (ctx.isNewInstance) {
        if (ctx.instance.type !== Story.TYPE.REVIEW)
          return resolve();
        verifyRating(ctx.instance.rating);
        verifyFObject(ctx.instance.objectId);
      }
      resolve();
    })
  }

  function verifyRating(rating) {
    if (!rating)
      throw ERRORS.badRequest('Rating required');
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(rating))
      throw ERRORS.badRequest('Invalid rating');
  }

  function verifyFObject(objectId) {
    if (!objectId)
      throw ERRORS.badRequest('Invalid objectId');

    // throw ERRORS.badRequest('Invalid objectId');
  }
};
