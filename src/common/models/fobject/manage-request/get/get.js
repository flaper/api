import {App} from '../../../../services/App';
import _ from 'lodash';

export function initGet(ManageRequest) {
  ManageRequest.customFind = customFind;

  ManageRequest.remoteMethod(
    'customFind',
    {
      http: {path: '/', verb: 'get'},
      description: `Find all ManageRequests matched by filter,
        by default with '${ManageRequest.STATUS.ACTIVE}' status.`,
      accessType: 'READ',
      accepts: {
        arg: 'filter',
        type: 'object',
        description: 'Filter defining fields, where, include, order, offset, and limit'
      },
      returns: {root: true}
    }
  );

  function customFind(filter) {
    return App.isSuper()
      .then(isSuper => {
        let status = _.get(filter, 'where.status', ManageRequest.STATUS.ACTIVE).toString();
        if (isSuper) {
          filter = filter ? filter : {};
          filter.where = filter.where ? filter.where : {};
          filter.where.status = status;
          return ManageRequest.find(filter);
        }
        let userId = App.getCurrentUserId();
        let where = {userId: userId, status: status};
        let subjectId = _.get(filter, 'where.subjectId');
        if (subjectId) {
          where.subjectId = subjectId.toString();
        }
        return ManageRequest.find({where: where});
      })
  }
}
