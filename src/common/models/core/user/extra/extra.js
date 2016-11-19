import _ from 'lodash';

export function initExtra(User) {
  User.getExtra = getExtra;
  User.updateExtraValue = updateExtraValue;
  User.updateExtraValueToLeast = updateExtraValueToLeast;

  User.remoteMethod('getExtra', {
    http: {verb: 'get', path: '/:id/extra'},
    description: 'Get extra',
    accessType: 'READ',
    accepts: [
      {arg: 'id', type: 'string', description: 'User Id', required: true}
    ],
    returns: {root: true}
  });

  function* getExtra(id) {
    const {UserExtra} = User.app.models;
    let extra = yield (UserExtra.findOne({where: {userId: id}}));
    let data = extra ? extra : {};
    data = _.pick(data, UserExtra.PROPERTIES_FOR_API);
    return data;
  }

  // is not supposed for API
  function updateExtraValue(userId, name, value) {
    const {UserExtra} = User.app.models;
    return UserExtra.updateValue(userId, name, value);
  }

  // is not supposed for API
  function* updateExtraValueToLeast(userId, name, value) {
    const {UserExtra} = User.app.models;
    return yield (UserExtra.updateValueToLeast(userId, name, value));
  }
}
