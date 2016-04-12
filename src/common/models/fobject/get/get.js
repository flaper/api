import {App} from '../../../services/App';
import {objectHasDeepKey} from '../../../utils/object';
import _ from 'lodash';

export function initGet(FObject) {
  FObject.disableRemoteMethod('find', true);
  FObject.disableRemoteMethod('count', true);

  FObject.commonDisableRemoteScope(FObject, 'scopePublic');
  FObject.commonDisableRemoteScope(FObject, 'scopeActive');

  FObject.customFind = customFind;
  FObject.customCount = customCount;

  FObject.remoteMethod(
    'customFind',
    {
      http: {path: '/', verb: 'get'},
      description: `Find all objects matched by filter, by default with '${FObject.STATUS.ACTIVE}' status.`,
      accessType: 'READ',
      accepts: {
        arg: 'filter',
        type: 'object',
        description: 'Filter defining fields, where, include, order, offset, and limit'
      },
      returns: {root: true}
    }
  );

  FObject.remoteMethod('customCount', {
    http: {verb: 'get', path: '/count'},
    description: 'Count number of objects matched by where',
    accessType: 'READ',
    accepts: {arg: 'where', type: 'object', description: 'Criteria to match model instances'},
    returns: {arg: 'count', type: 'number'}
  });


  function customFind(filter) {
    filter = filter ? filter : {};
    if (!filter['order']) {
      filter['order'] = 'created DESC';
    }
    if (!_.get(filter, 'where') || !objectHasDeepKey(filter.where, 'status')) {
      //be default we return only active stories
      return FObject.scopeActive(filter);
    }
    //but it is possible to request active and deleted as well
    return FObject.scopePublic(filter);
  }

  function customCount(where) {
    if (!objectHasDeepKey(where, 'status')) {
      //be default we return only active stories
      return FObject.scopeActive.count(where);
    }
    //but it is possible to request active and deleted as well
    return FObject.scopePublic.count(where);
  }
}
