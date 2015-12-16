import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import {objectHasDeepKey} from '../../../utils/object';
import _ from 'lodash';

export function initDefaultScope(Comment) {
  Comment.disableRemoteMethod('find', true);
  Comment.disableRemoteMethod('count', true);
  Comment.disableRemoteMethod('findById', true);

  Comment.commonDisableRemoteScope(Comment, 'scopeActive');

  Comment.customFind = customFind;
  Comment.customCount = customCount;
  Comment.customFindById = customFindById;

  Comment.remoteMethod(
    'customFind',
    {
      description: 'Find all comments matched by filter.',
      accessType: 'READ',
      accepts: {
        arg: 'filter',
        type: 'object',
        description: 'Filter defining fields, where, include, order, offset, and limit'
      },
      http: {path: '/', verb: 'get'},
      returns: {root: true}
    }
  );

  Comment.remoteMethod('customCount', {
    description: 'Count number of comments matched by where.',
    accessType: 'READ',
    accepts: {arg: 'where', type: 'object', description: 'Criteria to match model instances'},
    returns: {arg: 'count', type: 'number'},
    http: {verb: 'get', path: '/count'}
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


  function customFind(filter) {
    return Comment.scopeActive(filter);
  }

  function customCount(where) {
    return Comment.scopeActive.count(where);
  }

  function customFindById(id, filter) {
    return Comment.scopeActive.findById(id, filter);
  }
}
