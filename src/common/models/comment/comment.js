import {setCurrentUserId} from '../../behaviors/currentUser'
import {applyIdToType} from '../../behaviors/idToType'
import {Sanitize} from '@flaper/markdown';
import {initDefaultScope} from './methods/defaultScope';
import {initCustomDelete} from './methods/customDelete';
import {initSyncSubject} from './methods/syncSubject';
import {ignoreProperties, ignoreUpdatedIfNoChanges, setProperty} from '../../behaviors/propertiesHelper'
import {FlaperMark} from '../../../libs/markdown/markdown'
import {ERRORS} from '../../utils/errors';

import _ from 'lodash';

module.exports = (Comment) => {
  const ALLOWED_MODELS = ['Story', 'Image'];
  Comment.commonInit(Comment);
  applyIdToType(Comment);

  Comment.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };
  Comment.STATUSES = _.values(Comment.STATUS);

  Comment.validatesInclusionOf('status', {in: Comment.STATUSES});

  //Comment.disableRemoteMethod('updateAttributes', false);
  Comment.disableRemoteMethod('__get__subject', false);

  Comment.disableRemoteMethod('__get__user', false);
  Comment.observe('before save', ignoreUpdatedIfNoChanges(['content']));
  Comment.observe('before save', setCurrentUserId);
  Comment.observe('before save', subjectObserver);

  Comment.observe('before save', ignoreProperties({
    status: {newDefault: Comment.STATUS.ACTIVE},
    contentHTML: {},
    shortInline: {}
  }));
  Comment.observe('before save', contentObserver);

  function * contentObserver(ctx) {
    let sanitizeContent = Sanitize.observer('content', Sanitize.html);

    let value = yield(sanitizeContent(ctx));
    if (value) {
      let html = FlaperMark.toInline(value);
      let shortInline = FlaperMark.shortInline(value);

      setProperty(ctx, 'contentHTML', html);
      setProperty(ctx, 'shortInline', shortInline);
    }
  }

  initDefaultScope(Comment);
  initCustomDelete(Comment);
  initSyncSubject(Comment);

  let ignoreSubjectChange = ignoreProperties({subjectId: {}, subjectType: {}});

  function * subjectObserver(ctx) {
    if (!(ctx.instance && ctx.isNewInstance)) {
      return yield (ignoreSubjectChange(ctx));
    }

    let app = Comment.app;
    let IdToType = app.models.IdToType;
    let subjectId = ctx.instance.subjectId;
    if (!subjectId) throw ERRORS.badRequest("SubjectId should exist");

    let idToType = yield (IdToType.findByIdRequired(subjectId, null, ERRORS.badRequest));
    let type = idToType.type;
    ctx.instance.subjectType = type;
    if (!ALLOWED_MODELS.includes(type)) {
      throw ERRORS.badRequest(`Comments are not allowed for type '${type}'.`);
    }
    let Model = app.models[type];
    return yield (Model.findByIdRequired(subjectId));
  }
};
