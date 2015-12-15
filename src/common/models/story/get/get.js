import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import {objectHasDeepKey} from '../../../utils/object';

export function initGet(Story) {
  Story.disableRemoteMethod('__get__scopePublic', true);
  Story.disableRemoteMethod('__create__scopePublic', true);
  Story.disableRemoteMethod('__delete__scopePublic', true);
  Story.disableRemoteMethod('__count__scopePublic', true);
  Story.disableRemoteMethod('__get__scopeActive', true);
  Story.disableRemoteMethod('__create__scopeActive', true);
  Story.disableRemoteMethod('__delete__scopeActive', true);
  Story.disableRemoteMethod('__count__scopeActive', true);

  Story.customFind = customFind;

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
  function customFind(filter) {
    if (!objectHasDeepKey(filter, 'status')) {
      //be default we return only active stories
      return Story.scopeActive(filter);
    }
    //but it is possible to request active and deleted as well
    return Story.scopePublic(filter);
  }
}
