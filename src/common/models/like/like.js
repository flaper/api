import {App} from '../../services/App';
import {ignoreProperties} from '../../behaviors/ignoreProperties'
import {ERRORS} from '../../utils/errors';

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

  Like.actionCreate = actionCreate;

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
      });
  }
};
