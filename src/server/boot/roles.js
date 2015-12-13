import {RoleService} from '../../common/services/roleService.js';
module.exports = (app) => {
  //super can do everything that admin can do
  RoleService.init();
  app.models.Role.registerResolver('admin', (role, context, cb) => {
    function reject(err) {
      if (err) {
        return cb(err);
      }
      cb(null, false);
    }

    let userId = context.accessToken.userId;
    if (!userId) {
      return reject(); // do not allow anonymous users
    }

    RoleService.isAdmin(userId).then((result) => {
      if (result) {
        return cb(null, true);
      }
      reject();
    });
  });
};
