import {App} from '../services/App';
import {RoleService} from '../services/roleService.js';

//this will set userId if subject under creating
//for PUT/UPDATE it will ignore userId
export function setCurrentUserId(ctx) {
  if (!App.isWebServer()) {
    return Promise.resolve();
  }

  return App.getCurrentUser()
    .then((user) => {
      if (ctx.instance) {
        if (ctx.isNewInstance) {
          //this is adding (POST) e.g.
          ctx.instance.userId = user.id;
        } else {
          //this of model.save from inside app e.g.
          //just do nothing, leave userId as it is
        }
      } else {
        //so it is update - userId should not be changed
        delete ctx.data.userId;
      }
    });
}
