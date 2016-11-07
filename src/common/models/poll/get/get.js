import {App} from '../../../services/App';
import {objectHasDeepKey} from '../../../utils/object';
import {ERRORS} from '../../../utils/errors'
import _ from 'lodash';

export function initGet(Poll) {
  Poll.disableRemoteMethod('find', true);
  Poll.disableRemoteMethod('count', true);

  Poll.commonDisableRemoteScope(Poll, 'scopePublic');
  Poll.commonDisableRemoteScope(Poll, 'scopeActive');

  Poll.customFind = customFind;
  Poll.customCount = customCount;

  Poll.remoteMethod(
    'customFind',
    {
      http: {path: '/', verb: 'get'},
      description: `Возвращает все опросы удовлетворяющие фильтру, по умолчанию со статусом - '${Poll.STATUS.ACTIVE}'.`,
      accessType: 'READ',
      accepts: {
        arg: 'filter',
        type: 'object',
        description: 'Filter defining fields, where, include, order, offset, and limit'
      },
      returns: {root: true}
    }
  );

  Poll.remoteMethod('customCount', {
    http: {verb: 'get', path: '/count'},
    description: 'Возвращает количество опросов, удовлетворяющих условию where',
    accessType: 'READ',
    accepts: {arg: 'where', type: 'object', description: 'Criteria to match model instances'},
    returns: {arg: 'count', type: 'number'}
  });

  function customFind(filter) {
    filter = filter ? filter : {};
    filter.order = filter.order || 'created DESC';
    if (!_.get(filter, 'where') || !objectHasDeepKey(filter.where, 'status')) {
      //by default we return only active stories
      return Poll.scopeActive(filter);
    }
    //but it is possible to request active and deleted as well
    return Poll.scopePublic(filter);
  }

  function customCount(where) {
    if (!objectHasDeepKey(where, 'status')) {
      //be default we return only active stories
      return Poll.scopeActive.count(where);
    }
    //but it is possible to request active and deleted as well
    return Poll.scopePublic.count(where);
  }
}
