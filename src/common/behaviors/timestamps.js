import {App} from '../services/App';
//if used as mixins for common-model inheritance create double call for this method
//seems loopback doesn't handle mixins inheritance properly
export function timestampBehavior(ctx) {
  if (ctx.instance) {
    //notNewInstance if model.save() inside app, not from API call
    if (ctx.isNewInstance) {
      if (App.isWebServer()) {
        ctx.instance.created = new Date();
        ctx.instance.updated = new Date();
      } else {
        //fixtures migration
        ctx.instance.created = ctx.instance.created ? ctx.instance.created : new Date();
        ctx.instance.updated = ctx.instance.updated ? ctx.instance.updated : new Date();
      }
    } else {
      //!isNewInstance
      ctx.instance.updated = new Date();
    }
  } else {
    //updateAttributes / REST call
    //e.g. for update for API
    ctx.data.updated = new Date();
    delete ctx.data.created;
  }

  return Promise.resolve();
}
