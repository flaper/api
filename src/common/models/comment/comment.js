import {setCurrentUserId} from '../../behaviors/currentUser'
import {applyIdToType} from '../../behaviors/idToType'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {initDefaultScope} from './commonMethods/defaultScope';
import {initCustomDelete} from './commonMethods/customDelete';
import {ignoreProperties} from '../../behaviors/propertiesHelper'
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
  Comment.observe('before save', setCurrentUserId);
  Comment.observe('before save', subjectObserver);
  Comment.observe('before save', ignoreProperties({
    status: {newDefault: Comment.STATUS.ACTIVE},
    subjectType: {newDefault: 'story'}
  }));
  Comment.observe('before save', Sanitize.observer('content', Sanitize.text));

  Comment.observe('after save', syncSubject);

  initDefaultScope(Comment);
  initCustomDelete(Comment);

  Comment.updateSubject = updateSubject;

  let ignoreSubjectId = ignoreProperties({subjectId: {}});

  function updateSubject(subjectType, id) {
    let Model = Comment.app.models[subjectType];
    let count;
    let query = {subjectId: id, status: Comment.STATUS.ACTIVE};
    let lastActive = null;
    return Comment.count(query)
      .then((c) => {
        count = c;
        return Comment.findOne({where: query, order: 'created DESC'})
      })
      .then((comment) => {
        lastActive = comment ? comment.created : null;
        if (!lastActive) {
          return Model.findByIdRequired(id)
            .then((model) => {
              lastActive = model.created;
              return comment;
            })
        }
        return comment;
      })
      .then((comment) => Model.updateAll({id: id}, {commentsNumber: count, lastActive: lastActive},
        {skipIgnore: {commentsNumber: true, lastActive: true}}))
      .then(() => count);
  }

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

  function syncSubject(ctx) {
    if (!(ctx.instance && ctx.isNewInstance)) {
      return Promise.resolve();
    }
    //for new comment we sync subject
    return Comment.updateSubject('Story', ctx.instance.subjectId);
  }

};
