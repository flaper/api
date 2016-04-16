import {App} from '../../../../services/App';
import _ from 'lodash';
import {ERRORS} from '../../../../utils/errors';

export function initCreate(ManageRequest) {
  ManageRequest.customCreate = customCreate;
  ManageRequest.remoteMethod(
    'customCreate',
    {
      http: {path: '/', verb: 'post'},
      description: 'Create new ManageRequest',
      accessType: 'WRITE',
      accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
      returns: {root: true}
    }
  );

  function customCreate(data) {
    let subjectId = data.subjectId;
    if (!subjectId) throw ERRORS.badRequest('SubjectId is required');
    let userId = App.getCurrentUserId();
    let query = {userId, subjectId, status: ManageRequest.STATUS.ACTIVE};
    return ManageRequest.count(query)
      .then(count => {
        if (count) {
          throw ERRORS.badRequest('Request for this object already exists, you can cancel it');
        }
        return ManageRequest.create(data);
      })
  }
}
