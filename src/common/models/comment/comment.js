import {setCurrentUserId} from '../../behaviors/currentUser'
import {applyIdToType} from '../../behaviors/idToType'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {initDefaultScope} from './methods/defaultScope';
import {initCustomDelete} from './methods/customDelete';
import {initSyncSubject} from './methods/syncSubject';
import {ignoreProperties, ignoreUpdatedIfNoChanges, setProperty} from '../../behaviors/propertiesHelper'
import {FlaperMark} from '../../../libs/markdown/markdown'
import {ERRORS} from '../../utils/errors';

import _ from 'lodash';

module.exports = (Comment) => {
  Comment.commonInit(Comment);
  applyIdToType(Comment);

  Comment.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };
  Comment.STATUSES = _.values(Comment.STATUS);

  Comment.validatesInclusionOf('status', {in: Comment.STATUSES});

  Comment.disableRemoteMethod('updateAttributes', false);
  Comment.disableRemoteMethod('__get__subject', false);

  Comment.disableRemoteMethod('__get__user', false);
  Comment.observe('before save', ignoreUpdatedIfNoChanges(['content']));
  Comment.observe('before save', setCurrentUserId);
  Comment.observe('before save', subjectObserver);

  Comment.observe('before save', ignoreProperties({
    status: {newDefault: Comment.STATUS.ACTIVE},
    subjectType: {newDefault: 'story'},
    contentHTML: {},
    shortInline: {}
  }));
  Comment.observe('before save', contentObserver);

  function contentObserver(ctx) {
    let sanitizeContent = Sanitize.observer('content', Sanitize.html);

    return sanitizeContent(ctx)
      .then((value) => {
        if (value) {
          let html = FlaperMark.toInline(value);
          let shortInline = FlaperMark.shortInline(value);

          setProperty(ctx, 'contentHTML', html);
          setProperty(ctx, 'shortInline', shortInline);
        }
      })
  }

  initDefaultScope(Comment);
  initCustomDelete(Comment);
  initSyncSubject(Comment);

  let ignoreSubjectId = ignoreProperties({subjectId: {}});

  function subjectObserver(ctx) {
    let Story = Comment.app.models.Story;
    if (!(ctx.instance && ctx.isNewInstance)) {
      return ignoreSubjectId(ctx);
    }

    let subjectId = ctx.instance.subjectId;
    if (!subjectId) {
      return Promise.reject(ERRORS.badRequest("SubjectId should exist"));
    }
    return Story.findByIdRequired(subjectId, null, ERRORS.badRequest);
  }
};
