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
        //this is adding (POST)
        ctx.instance.userId = user.id;
      } else {
        //so it is update - userId should not be changed
        delete ctx.data.userId;
      }
    });
}
