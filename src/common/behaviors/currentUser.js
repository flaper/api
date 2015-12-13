import {App} from '../services/App';
import {RoleService} from '../services/roleService.js';

export function setCurrentUserId(ctx) {
  if (!App.isWebRequest()) {
    return Promise.resolve();
  }

  return App.getCurrentUser()
    .then((user) => {
      return RoleService.isAdmin(user.id)
        .then((isAdmin) => {
          if (ctx.instance) {
            ctx.instance.userId = user.id;
          } else {
            //so it is update - admin can set any userId if he wants
            if (!isAdmin) {
              ctx.data.userId = user.id;
            }
          }
        });
    })
}
