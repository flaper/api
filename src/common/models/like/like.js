import {App} from '../../services/App';
import {ignoreProperties} from '../../behaviors/propertiesHelper'
import {ERRORS} from '../../utils/errors';
import {propertiesFilter} from '../../utils/object';

import _ from 'lodash';


module.exports = (Like) => {
  const ALLOWED_MODELS = ['Story', 'Comment'];
  Like.commonInit(Like);

  Like.disableRemoteMethod('updateAttributes', false);
  Like.disableRemoteMethod('__get__subject', false);
  Like.disableRemoteMethod('__get__user', false);
  Like.disableRemoteMethod('exists', true);
  Like.disableRemoteMethod('findById', true);
  Like.disableRemoteMethod('deleteById', true);
  Like.disableRemoteMethod('create', true);

  Like.RETURN_STATUS = {
    CREATED: 'created',
    DELETED: 'deleted'
  };

  Like.updateSubject = (subjectType, id) => {
    let Model = Like.app.models[subjectType];
    let count;
    return Like.count({subjectId: id})
      .then((c) => {
        count = c;
        return Model.updateAll({id: id}, {numberOfLikes: count}, {skipIgnore: {numberOfLikes: true}})
      })
      .then(() => count);
  };

  Like.actionCreate = actionCreate;
  Like.actionDelete = actionDelete;

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

  function actionCreate(subjectId) {
    //userId should exist
    let userId = App.getCurrentUserId();
    let IdToType = Like.app.models.IdToType;
    let subjectType;
    return IdToType.findByIdRequired(subjectId)
      .then(idToType => {
        subjectType = idToType.type;
        if (ALLOWED_MODELS.indexOf(subjectType) === -1) {
          throw ERRORS.badRequest(`Likes are not allowed for type '${subjectType}'.`)
        }
        return idToType.findSubject();
      })
      .then(subject => {
        if (subject.userId.toString() === userId.toString()) {
          throw ERRORS.badRequest('Cannot like own subject.')
        }
      })
      //findOne works without implicit and
      .then(() => Like.findOne({where: {subjectId, userId}}))
      .then((like) => {
        if (like) {
          throw ERRORS.badRequest('Like already exists.');
        }
        return Like.create({subjectId, userId, subjectType});
      })
      .then(() => Like.updateSubject(subjectType, subjectId))
      .then((count) => {
        return {
          status: Like.RETURN_STATUS.CREATED,
          count: count
        }
      })
  }

  function actionDelete(subjectId) {
    let IdToType = Like.app.models.IdToType;

    let subjectType;
    //userId should exist
    let userId = App.getCurrentUserId();
    return Like.findOne({where: {subjectId, userId}})
      .then((like) => {
        if (!like) throw  ERRORS.notFound('No such like');
        //delete works without implicit and
        return Like.deleteAll({subjectId, userId});
      })
      .then(() => IdToType.findByIdRequired(subjectId))
      .then((idToType) => {
        subjectType = idToType.type;
        return Like.updateSubject(subjectType, subjectId);
      })
      .then((count) => {
        return {
          status: Like.RETURN_STATUS.DELETED,
          count: count
        }
      })
  }
};
