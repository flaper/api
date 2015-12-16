import {setCurrentUserId} from '../../behaviors/currentUser'
import {ignoreProperties} from '../../behaviors/ignoreProperties'
import {ERRORS} from '../../utils/errors';

import _ from 'lodash';

module.exports = (Like) => {
  Like.commonInit(Like);

  Like.disableRemoteMethod('updateAttributes', false);
  Like.disableRemoteMethod('__get__subject', false);
  Like.disableRemoteMethod('__get__user', false);
  Like.disableRemoteMethod('exists', true);
  Like.disableRemoteMethod('findById', true);
  Like.disableRemoteMethod('deleteById', true);

  Like.observe('before save', setCurrentUserId);
  //Like.observe('before save', subjectObserver);
  //Like.observe('before save', ignoreProperties({
  //  subjectType: {newDefault: 'story'}
  //}));

  let ignoreSubjectId = ignoreProperties({subjectId: {}});

  //function subjectObserver(ctx) {
  //  let Story = Like.app.models.Story;
  //  if (!(ctx.instance && ctx.isNewInstance)) {
  //    return ignoreSubjectId(ctx);
  //  }
  //
  //  let subjectId = ctx.instance.subjectId;
  //  if (!subjectId) {
  //    return Promise.reject(ERRORS.badRequest("SubjectId should exist"));
  //  }
  //  return Story.findByIdRequired(subjectId, ERRORS.badRequest);
  //}

};
