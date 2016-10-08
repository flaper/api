import {App} from '../../../../services/App.js';
import {ERRORS} from '../../../../utils/errors.js';
import _ from 'lodash';

export function initGet(ManageRequest) {
  ManageRequest.customFind = customFind;
  ManageRequest.customCount = customCount;

  ManageRequest.remoteMethod(
    'customFind',
    {
      http: {path: '/', verb: 'get'},
      description: `Найти все ManageRequests по фильтру,
        по умолчанию со статусом - '${ManageRequest.STATUS.ACTIVE}'.`,
      accessType: 'READ',
      accepts: {
        arg: 'filter',
        type: 'object',
        description: 'Фильтр определяющий fields, where, include, order, offset, and limit'
      },
      returns: {root: true}
    }
  );

  ManageRequest.remoteMethod(
    'customCount',
    {
      http: {path: '/count', verb: 'get'},
      description: `Количество ManageRequests удовлетваряющих where,
        по умолчанию со статусом - '${ManageRequest.STATUS.ACTIVE}'.`,
      accessType: 'READ',
      accepts: {
        arg: 'where',
        type: 'object',
        description: 'Фильтр определяющий критерий выборки'
      },
      returns: {root: true}
    }
  );

  function* customFind(filter = {}) {
    // should be at top, because userId can be lost, loopback issue
    let userId = App.getCurrentUserId();
    let isSales = yield (App.isSales());
    let status = _.get(filter, 'where.status', ManageRequest.STATUS.ACTIVE).toString();
    if (isSales) {
      filter.where = filter.where ? filter.where : {};
      filter.where.status = status;
      return yield (ManageRequest.find(filter));
    }
    let where = {userId: userId, status: status};
    let subjectId = _.get(filter, 'where.subjectId');
    if (subjectId) {
      where.subjectId = subjectId.toString();
    }
    return yield (ManageRequest.find({where: where}));
  }

  function* customCount(where = {}) {
    // should be at top, because userId can be lost, loopback issue
    let userId = App.getCurrentUserId();
    let isSales = yield (App.isSales());
    if (!isSales)
      throw ERRORS.forbidden('Доступ только сотрудникам');
    where.status = _.get(where, 'status', ManageRequest.STATUS.ACTIVE).toString();
    return yield (ManageRequest.count(where));
  }
}
