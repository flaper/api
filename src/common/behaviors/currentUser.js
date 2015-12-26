import {App} from '../services/App';
import {RoleService} from '../services/roleService.js';
import _ from 'lodash';

//this will set userId if subject under creating
//for PUT/UPDATE it will ignore userId
export function setCurrentUserId(ctx) {
  //this is workaround, as sometimes we just lose loopback.getCurrentContext()
  let userId = _.get(ctx, 'options.currentUserId', null);
  if (!userId && !App.isWebServer()) {
    return Promise.resolve();
  }
  return App.getCurrentUser(userId)
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
        //Model.updateAll && model.updateAttributes goes here
        //userId should not be changed
        delete ctx.data.userId;
      }
    });
}
