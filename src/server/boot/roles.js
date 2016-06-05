import {RoleService} from '../../common/services/roleService.js';
module.exports = (app) => {
  //super can do everything that admin can do
  RoleService.init();
  app.models.Role.registerResolver('admin', roleResolverWrapper(RoleService.isAdmin));
  app.models.Role.registerResolver('sales', roleResolverWrapper(RoleService.isSales));

  function roleResolverWrapper(method) {
    return (role, context, cb) => {
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

      method(userId).then((result) => {
        if (result) {
          return cb(null, true);
        }
        reject();
      });
    };
  }
};
