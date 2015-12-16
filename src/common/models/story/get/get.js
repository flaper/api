import {App} from '../../../services/App';
import {objectHasDeepKey} from '../../../utils/object';
import _ from 'lodash';

export function initGet(Story) {
  Story.disableRemoteMethod('find', true);
  Story.disableRemoteMethod('count', true);

  Story.commonDisableRemoteScope(Story, 'scopePublic');
  Story.commonDisableRemoteScope(Story, 'scopeActive');

  Story.customFind = customFind;
  Story.customCount = customCount;

  Story.remoteMethod(
    'customFind',
    {
      description: `Find all stories matched by filter, by default with '${Story.STATUS.ACTIVE}' status.`,
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

  Story.remoteMethod('customCount', {
    description: 'Count number of stories matched by where',
    accessType: 'READ',
    accepts: {arg: 'where', type: 'object', description: 'Criteria to match model instances'},
    returns: {arg: 'count', type: 'number'},
    http: {verb: 'get', path: '/count'}
  });


  function customFind(filter) {
    if (!_.get(filter, 'where') || !objectHasDeepKey(filter.where, 'status')) {
      //be default we return only active stories
      return Story.scopeActive(filter);
    }
    //but it is possible to request active and deleted as well
    return Story.scopePublic(filter);
  }

  function customCount(where) {
    if (!objectHasDeepKey(where, 'status')) {
      //be default we return only active stories
      return Story.scopeActive.count(where);
    }
    //but it is possible to request active and deleted as well
    return Story.scopePublic.count(where);
  }
}
