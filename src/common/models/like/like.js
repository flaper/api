import {App} from '../../services/App';
import {ERRORS} from '../../utils/errors';
import {initSyncUser} from './methods/syncUser';
import co from 'co';

module.exports = (Like) => {
  const ALLOWED_MODELS = ['Story', 'Comment', 'Image'];
  Like.commonInit(Like);
  Like.disableAllRemotesExcept(Like, ['count', 'find']);

  Like.disableRemoteMethod('__get__subject', false);
  Like.disableRemoteMethod('__get__user', false);

  initSyncUser(Like);

  Like.RETURN_STATUS = {
    CREATED: 'created',
    DELETED: 'deleted'
  };

  Like.iSyncSubject = (subjectType, id) => {
    return co(function*() {
      let Model = Like.app.models[subjectType];
      let count = yield Like.count({subjectId: id});
      yield Model.updateAll({id: id}, {likesNumber: count}, {skipIgnore: {likesNumber: true}});
      return count;
    });
  };

  Like.actionToggle = actionToggle;
  Like.actionCreate = actionCreate;
  Like.actionDelete = actionDelete;

  Like.remoteMethod(
    'actionToggle',
    {
      description: `Toggle like for subject`,
      http: {path: '/toggle/:subjectId', verb: 'post'},
      accepts: [
        {arg: 'subjectId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Like.remoteMethod(
    'actionCreate',
    {
      description: `Create a like for subject`,
      http: {path: '/:subjectId', verb: 'post'},
      accepts: [
        {arg: 'subjectId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  Like.remoteMethod(
    'actionDelete',
    {
      description: `Delete a like for subject`,
      http: {path: '/:subjectId', verb: 'delete'},
      accepts: [
        {arg: 'subjectId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );

  function* actionToggle(subjectId) {
    //userId should exist
    let userId = App.getCurrentUserId();
    let like = yield Like.findOne({where: {subjectId, userId}});
    return like ? yield actionInternalDelete(subjectId, userId) : yield actionInternalCreate(subjectId, userId);
  }

  function * actionCreate(subjectId) {
    //userId should exist
    let userId = App.getCurrentUserId();
    let like = yield Like.findOne({where: {subjectId, userId}});
    if (like) {
      throw ERRORS.badRequest('Like already exists.');
    }
    return yield actionInternalCreate(subjectId, userId);
  }

  function * actionInternalCreate(subjectId, userId) {
    let {IdToType, User} = Like.app.models;
    let idToType = yield (IdToType.findByIdRequired(subjectId));
    let subjectType = idToType.type;
    if (!ALLOWED_MODELS.includes(subjectType)) {
      throw ERRORS.badRequest(`Likes are not allowed for type '${subjectType}'.`)
    }
    if (subjectType === 'Story') {
      let user = yield User.findByIdRequired(userId);
      let dayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
      let count = yield Like.count({subjectType: 'Story', userId, created: {gt: dayAgo}});
      console.log('likes number', count);
      if (count >= user.level + 2)
        throw ERRORS.forbidden("Пишите отзывы, чтобы увеличить лимит", "likes_limit");
    }
    let subject = yield (idToType.findSubject());
    if (subject.userId.toString() === userId.toString()) {
      throw ERRORS.badRequest('Нельзя лайкать свое')
    }
    let subjectUserId = subject.userId;
    yield (Like.create({subjectId, userId, subjectType, subjectUserId}));
    let count = yield (Like.iSyncSubject(subjectType, subjectId));
    if (subjectType === 'Story') {
      Like.syncUserFromStory(subjectId);
    }
    return {
      status: Like.RETURN_STATUS.CREATED,
      count: count
    };
  }

  function * actionDelete(subjectId) {
    //userId should exist
    let userId = App.getCurrentUserId();
    let like = yield (Like.findOne({where: {subjectId, userId}}));
    if (!like) throw  ERRORS.notFound('No such like');
    return yield actionInternalDelete(subjectId, userId);
  }

  function * actionInternalDelete(subjectId, userId) {
    let {IdToType} = Like.app.models;

    yield Like.deleteAll({subjectId, userId});
    let idToType = yield IdToType.findByIdRequired(subjectId);
    let count = yield Like.iSyncSubject(idToType.type, subjectId);
    if (idToType.type === 'Story') {
      Like.syncUserFromStory(subjectId);
    }
    return {
      status: Like.RETURN_STATUS.DELETED,
      count: count
    }
  }
};
