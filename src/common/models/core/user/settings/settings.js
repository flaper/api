import {App} from '../../../../services/App';
import {ERRORS} from '../../../../utils/errors';

export function initSettings(User) {
  User.getSettingsByUser = getSettingsByUser;
  User.saveSettings = saveSettings;

  User.remoteMethod('getSettingsByUser', {
    http: {verb: 'get', path: '/:id/settings'},
    description: 'Get settings',
    accessType: 'READ',
    accepts: [
      {arg: 'id', type: 'string', description: 'User Id', required: true}
    ],
    returns: {root: true}
  });

  User.remoteMethod('saveSettings', {
    http: {verb: 'post', path: '/:id/settings/:name'},
    description: 'Save settings',
    accessType: 'WRITE',
    accepts: [
      {arg: 'id', type: 'string', description: 'User Id', required: true},
      {arg: 'name', type: 'string', description: 'Settings name', required: true},
      {arg: 'value', type: 'string', description: 'Settings value', required: true}
    ],
    returns: {root: true}
  });

  function getSettingsByUser(id) {
    let UserSettings = User.app.models.UserSettings;
    return User.findByIdRequired(id)
      .then(() => UserSettings.find({userId: id}))
      .then((rows) => {
        let res = {};
        rows.forEach((row) => {
          res[row.name] = row.value;
        });
        return res;
      })
  }

  function saveSettings(id, name, value) {
    let UserSettings = User.app.models.UserSettings;
    if (!UserSettings.NAMES.hasOwnProperty(name)) {
      throw ERRORS.badRequest(`settings - ${name} is not allowed`);
    }
    return UserSettings.updateSetting(id, name, value);
  }
}
