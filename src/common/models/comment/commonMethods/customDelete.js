import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import {objectHasDeepKey} from '../../../utils/object';
import _ from 'lodash';

export function initCustomDelete(Comment) {
  Comment.disableRemoteMethod('deleteById', true);
  Comment.customDeleteById = customDeleteById;


  Comment.remoteMethod('customDeleteById', {
    aliases: ['destroyById', 'removeById'],
    description: 'Delete a comment by id.',
    accessType: 'WRITE',
    accepts: {
      arg: 'id', type: 'any', description: 'Comment id', required: true,
      http: {source: 'path'}
    },
    http: {verb: 'del', path: '/:id'},
    returns: {arg: 'count', type: 'object', root: true}
  });

  Comment.remoteMethod('customFindById', {
    description: 'Find a comment by id.',
    accessType: 'READ',
    accepts: [
      {
        arg: 'id', type: 'any', description: 'Comment id', required: true,
        http: {source: 'path'}
      },
      {
        arg: 'filter', type: 'object',
        description: 'Filter defining fields and include'
      }
    ],
    returns: {arg: 'data', type: 'Comment', root: true},
    http: {verb: 'get', path: '/:id'},
    rest: {after: ERRORS.convertNullToNotFoundError}
  });


  function customDeleteById(id) {
    let res = null;
    //findByIdRequired called to enforce existence
    return Comment.scopeActive.findByIdRequired(id)
      .then((comment) => {
        res = comment;
        comment.status = Comment.STATUS.DELETED;
        return comment.save({skipIgnore: {status: true}});
      })
      .then((comment) => Comment.updateSubject('Story', comment.subjectId))
      .then(() => res);
  }
}
