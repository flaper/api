import {setCurrentUserId} from '../../behaviors/currentUser'
import {applyIdToType} from '../../behaviors/idToType'
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../behaviors/propertiesHelper.js'
import {SanitizeHelper} from '../../../libs/sanitize/SanitizeHelper.js';
import {FlaperMark, Sanitize} from '@flaper/markdown';
import {initStatusActions} from './status/status';
import {initGet} from './get/get.js';
import {initAuditRest} from './get/audit.js';
import {enableAudit} from '../../behaviors/auditable.js';
import {initSyncUser} from './methods/syncUser.js';
import {initSyncObject} from './methods/syncObject.js';
import {initSyncAll} from './methods/syncAll.js';
import {initDelete} from './methods/internalDelete';
import {ERRORS} from '../../utils/errors';
import _ from 'lodash';
import co from 'co';

module.exports = (Story) => {
  Story.commonInit(Story);
  applyIdToType(Story);
  enableAudit(Story, {pick: ["status", "type", "title", "content", "rating", "objectId", "userId"]});

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

  Story.getInitialSlug = (story) => {
    switch (story.type) {
      case Story.TYPE.ARTICLE:
        return story.title;
      case Story.TYPE.REVIEW:
        return story.title || story.flapId || "";
      default:
        throw ERRORS.badRequest('Wrong story type for getInitialSlug')
    }
  };

  Story.slugFilter = (story) => {
    let filter = {status: 'active', type: story.type};
    if (story.type === Story.TYPE.REVIEW) {
      filter.objectId = story.objectId;
    }
    return filter;
  };

  Story.validatesInclusionOf('status', {in: Story.STATUSES});

  Story.MAX_TAGS = 3;
  Story.MIN_LENGTH = {
    article: 1000,
    review: 256
  };

  Story.disableAllRemotesExcept(Story, ['find', 'findById', 'updateAttributes', 'count', 'exists', 'create']);

  Story.disableRemoteMethod('__get__user', false);

  Story.observe('before save', ignoreUpdatedIfNoChanges(['title', 'content']));
  Story.observe('before save', setCurrentUserId);
  Story.observe('before save', ignoreProperties({
    status: {newDefault: Story.STATUS.ACTIVE},
    contentHTML: {},
    shortInline: {},
    shortText: {},
    domain: {},
    region: {},
    views: {},
    viewsRecent: {},
    lastActive: {newDefault: (data) => data.created},
    commentsNumber: {newDefault: 0},
    auditsNumber: {newDefault: 0},
    flapId: {},
    images: {newDefault: []},
    answer: {}, // официальный ответ, только для объектов
    flagCp: {}, // флаг на дополнительную проверку copyright
  }));
  Story.observe('before save', typeObserver);
  Story.observe('before save', SanitizeHelper.observer('title', Sanitize.text));
  Story.observe('before save', minLengthObserver);
  Story.observe('before save', contentObserver);
  Story.observe('before save', SanitizeHelper.observer('tags', tagSanitize));
  Story.observe('before save', reviewObserver);
  Story.observe('before save', articleObserver);
  Story.observe('after save', afterSaveObserver);

  initSyncUser(Story);
  initSyncObject(Story);
  initSyncAll(Story);
  initStatusActions(Story);
  initGet(Story);
  initAuditRest(Story);
  initDelete(Story);

  function* typeObserver(ctx) {
    if (ctx.isNewInstance) {
      let type = ctx.instance.type;
      if (!Story.TYPES.includes(type)) throw ERRORS.badRequest(`Wrong type "${type}" for story`);
      return;
    }
    if (ctx.instance) {
      delete ctx.instance.type;
    }
  }

  function minLengthObserver(ctx) {
    let type = ctx.instance ? ctx.instance.type : _.get(ctx, 'currentInstance.type');
    if (!type) {
      if (ctx.data) delete ctx.data.content;
      // e.g. just updating comments number
      return Promise.resolve();
    }
    let observer = SanitizeHelper.alphaMinLengthObserver('content', Story.MIN_LENGTH[type]);
    return observer(ctx);
  }

  function* contentObserver(ctx) {
    let sanitizeContent = SanitizeHelper.observer('content', Sanitize.html);

    let content = yield (sanitizeContent(ctx));
    if (!content)
      return;
    ctx.hookState.content = content;
    let html = FlaperMark.toHTML(content);
    let shortInline = FlaperMark.shortInline(content);
    let shortText = Sanitize.text(shortInline);
    let images = FlaperMark.getImages(content);

    setProperty(ctx, 'contentHTML', html);
    setProperty(ctx, 'shortInline', shortInline);
    setProperty(ctx, 'shortText', shortText);
    setProperty(ctx, 'images', images);
    if (isFlagCp(content))
      setProperty(ctx, 'flagCp', true);
  }

  function* afterSaveObserver(ctx) {
    let content = ctx.hookState.content;
    if (content) {
      // если изменяли content
      const Image = Story.app.models.Image;
      let images = FlaperMark.getImages(content);
      Image.updateObject({ids: images, objectId: ctx.instance.id, type: Image.TYPE.STORY});
    }
  }

  function tagSanitize(array) {
    let a = array.slice(0, Story.MAX_TAGS);
    a = a.map(s => s.toLocaleLowerCase());
    a = a.map(i => i.replace(/[^a-z0-9а-яё]/g, ''));
    //filter empty strings
    return a.filter(a => a)
  }

  function* reviewObserver(ctx) {
    if (ctx.isNewInstance) {
      if (ctx.instance.type !== Story.TYPE.REVIEW)
        return;
      verifyRating(ctx.instance.rating);
      let obj = yield verifyFObject(ctx.instance.objectId);
      ctx.instance.domain = [obj.mainDomain];
      if (obj.region)
        ctx.instance.region = obj.region;
      if (obj.mainDomain === 'кино')
        setProperty(ctx, 'flagCp', true);
      return;
    }

    // updating existing instance via
    // !ctx.currentInstance - happens for internal model.save
    if (!ctx.currentInstance || ctx.currentInstance.type !== Story.TYPE.REVIEW)
      return;
    if (ctx.data.rating)
      verifyRating(ctx.data.rating);
    if (ctx.data.objectId)
      throw ERRORS.badRequest(`Set/change of objectId is not supported via this method`);
  }

  function verifyRating(rating) {
    if (!rating)
      throw ERRORS.badRequest('Rating required');
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(rating))
      throw ERRORS.badRequest('Invalid rating');
  }

  function verifyFObject(objectId) {
    return co(function*() {
      if (!objectId)
        throw ERRORS.badRequest('Invalid objectId');
      let FObject = Story.app.models.FObject;
      let obj = yield FObject.findById(objectId);
      if (!obj)
        throw ERRORS.badRequest(`Object with id ${objectId} does not exists`);
      return obj;
    });
  }

  function * articleObserver(ctx) {
    if (ctx.isNewInstance) {
      if (ctx.instance.type !== Story.TYPE.ARTICLE)
        return;
      if (!ctx.instance.title)
        throw ERRORS.badRequest(`Title is required for article`);
    }
    // update existing instance
  }

  function isFlagCp(content) {
    let words = ['кино', 'фильм'];
    for (let word of words) {
      if (content.includes(word))
        return true;
    }
    return false;
  }
};
