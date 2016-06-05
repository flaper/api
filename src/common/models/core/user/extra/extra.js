import {App} from '../../../../services/App';
import {ERRORS} from '../../../../utils/errors';
import _ from 'lodash';

export function initExtra(User) {
  User.getExtra = getExtra;
  User.updateExtraValue = updateExtraValue;

  User.remoteMethod('getExtra', {
    http: {verb: 'get', path: '/:id/extra'},
    description: 'Get extra',
    accessType: 'READ',
    accepts: [
      {arg: 'id', type: 'string', description: 'User Id', required: true}
    ],
    returns: {root: true}
  });

  function getExtra(id) {
    let UserExtra = User.app.models.UserExtra;
    return UserExtra.findOne({where: {userId: id}})
      .then((extra) => {
        let data = extra ? extra : {};
        data = _.pick(data, UserExtra.PROPERTIES_FOR_API);
        return data;
      })
  }

  //is not supposed for API
  function updateExtraValue(userId, name, value) {
    let UserExtra = User.app.models.UserExtra;
    UserExtra.updateValue(userId, name, value);
  }
}
