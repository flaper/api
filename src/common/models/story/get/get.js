import {App} from '../../../services/App';
import {ERRORS} from '../../../errors/errors';

export function initGet(Story) {
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
    return Story.scopePublic(filter);
  }
}
