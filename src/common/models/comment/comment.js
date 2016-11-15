import {App} from '../../services/App.js'
import {setCurrentUserId} from '../../behaviors/currentUser'
import {applyIdToType} from '../../behaviors/idToType'
import {SanitizeHelper} from '../../../libs/sanitize/SanitizeHelper';
import {initDefaultScope} from './methods/defaultScope';
import {initCustomDelete} from './methods/customDelete';
import {initSyncSubject} from './methods/syncSubject';
import {ignoreProperties, ignoreUpdatedIfNoChanges, setProperty} from '../../behaviors/propertiesHelper'
import {FlaperMark, Sanitize} from '@flaper/markdown';
import {ERRORS} from '../../utils/errors';
import {OBJECT_PERMISSIONS} from '@flaper/consts';

import _ from 'lodash';

module.exports = (Comment) => {
  const ALLOWED_MODELS = ['Story', 'Image', 'Poll'];
  Comment.commonInit(Comment);
  applyIdToType(Comment);

  Comment.STATUS = {
    ACTIVE: 'active',
    // last_answer - последний комментарий, являющийся официальным ответом, не отображается в общем списке комментариев
    LAST_ANSWER: 'last_answer',
    DELETED: 'deleted'
  };
  Comment.STATUSES = _.values(Comment.STATUS);

  Comment.validatesInclusionOf('status', {in: Comment.STATUSES});

  Comment.disableAllRemotesExcept(Comment, ['find', 'findById', 'count', 'exists', 'create', 'updateAttributes']);
  Comment.disableRemoteMethod('__get__subject', false);

  Comment.disableRemoteMethod('__get__user', false);
  Comment.observe('before save', ignoreUpdatedIfNoChanges(['content']));
  Comment.observe('before save', ignoreProperties({
    status: {newDefault: Comment.STATUS.ACTIVE},
    contentHTML: {},
    shortInline: {},
    isAnswer: {},
  }));
  Comment.observe('before save', setCurrentUserId);
  Comment.observe('before save', subjectObserver);

  Comment.observe('before save', contentObserver);
  Comment.observe('after save', answerObserver);

  function * contentObserver(ctx) {
    let sanitizeContent = SanitizeHelper.observer('content', Sanitize.html);

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

  function * subjectObserver(ctx) {
    if (!(ctx.instance && ctx.isNewInstance)) {
      let ignoreSubjectChange = ignoreProperties({subjectId: {}, subjectType: {}});
      return yield (ignoreSubjectChange(ctx));
    }
    let userId = ctx.instance.userId;

    let app = Comment.app;
    const {IdToType, User, FObject} = app.models;
    let subjectId = ctx.instance.subjectId;
    if (!subjectId) throw ERRORS.badRequest("SubjectId should exist");

    let idToType = yield (IdToType.findByIdRequired(subjectId, null, ERRORS.badRequest));
    let type = idToType.type;
    ctx.instance.subjectType = type;
    if (!ALLOWED_MODELS.includes(type)) {
      throw ERRORS.badRequest(`Comments are not allowed for type '${type}'.`);
    }
    let Model = app.models[type];
    let model = yield (Model.findByIdRequired(subjectId));

    // официальный ответ компании
    if (type !== 'Story' || !model.objectId)
      return;
    let isOwner = yield (User.isOwner(userId, model.objectId));
    if (!isOwner)
      return;
    let permissions = yield (FObject.iGetPermissions(model.objectId, userId));
    if (!permissions.includes(OBJECT_PERMISSIONS.ANSWER))
      throw ERRORS.badRequest('Нет разрешений на оставление официальных ответов');
    setProperty(ctx, 'isAnswer', true);
    setProperty(ctx, 'status', Comment.STATUS.LAST_ANSWER);
    ctx.hookState.isAnswer = true;
  }

  function* answerObserver(ctx) {
    if (!ctx.hookState.isAnswer)
      return;
    let {id, subjectId} = ctx.instance;
    const {Story} = Comment.app.models;
    yield (Story.updateAll({id: subjectId}, {answer: ctx.instance.__data}, {skipIgnore: {answer: true}}));
    yield (Comment.updateAll({subjectId: subjectId, status: Comment.STATUS.LAST_ANSWER, id: {neq: id}},
      {status: Comment.STATUS.ACTIVE}, {skipIgnore: {status: true}}));
  }
};
