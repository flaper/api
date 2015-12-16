import {setCurrentUserId} from '../../behaviors/currentUser'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {initDefaultScope} from './defaultScope/defaultScope';
import {ignoreProperties} from '../../behaviors/ignoreProperties'
import {ERRORS} from '../../utils/errors';

import _ from 'lodash';

module.exports = (Comment) => {
  Comment.commonInit(Comment);

  Comment.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };
  Comment.STATUSES = _.values(Comment.STATUS);

  Comment.validatesInclusionOf('status', {in: Comment.STATUSES});

  Comment.disableRemoteMethod('deleteById', true);
  Comment.disableRemoteMethod('updateAttributes', false);
  Comment.disableRemoteMethod('__get__subject', false);

  Comment.disableRemoteMethod('__get__user', false);
  Comment.observe('before save', setCurrentUserId);
  Comment.observe('before save', subjectObserver);
  Comment.observe('before save', ignoreProperties({
    status: {newDefault: Comment.STATUS.ACTIVE},
    subjectType: {newDefault: 'story'}
  }));
  Comment.observe('before save', Sanitize.observer('content', Sanitize.text));

  initDefaultScope(Comment);

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
    return Story.findByIdRequired(subjectId, ERRORS.badRequest);
  }

};
