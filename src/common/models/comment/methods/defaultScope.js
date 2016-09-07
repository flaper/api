import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import {objectHasDeepKey} from '../../../utils/object';
import _ from 'lodash';
const ObjectID = require('mongodb').ObjectID;

export function initDefaultScope(Comment) {
  Comment.disableRemoteMethod('find', true);
  Comment.disableRemoteMethod('count', true);
  Comment.disableRemoteMethod('findById', true);

  Comment.commonDisableRemoteScope(Comment, 'scopeActive');

  Comment.customFind = customFind;
  Comment.customCount = customCount;
  Comment.customFindById = customFindById;
  Comment.lastCommentsByIds = lastCommentsByIds;

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

  Comment.remoteMethod('lastCommentsByIds', {
    description: 'Return 3 last comments for each subject id',
    accessType: 'READ',
    accepts: {arg: 'ids', type: 'any', description: 'Subject Ids', required: true},
    returns: {root: true},
    http: {verb: 'get', path: '/last'}
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

  function lastCommentsByIds(ids) {
    let idsArray = [];
    try {
      idsArray = JSON.parse(ids);
    }
    catch (e) {
      throw ERRORS.badRequest('Cannot parse ids');
    }

    if (!(idsArray instanceof Array)) {
      throw ERRORS.badRequest('Ids should be array');
    }

    if (idsArray.length > 100) {
      throw ERRORS.badRequest('To many ids');
    }
    let promises = [];
    let result = {};
    idsArray.forEach(id => {
      let promise = Comment.scopeActive({where: {subjectId: new ObjectID(id)}, limit: 3, order: 'created desc'})
        .then(data => {
          result[id] = data;
        });
      promises.push(promise);
    });
    return Promise.all(promises)
      .then(() => result)
  }
}
