import {App} from '../services/App';
//if used as mixins for common-model inheritance create double call for this method
//seems loopback doesn't handle mixins inheritance properly
export function timestampBehavior(ctx) {
  let skipCreated = ctx.options && ctx.options.skipTimestampCreated;
  if (skipCreated) {
    if (ctx.instance) {
      ctx.instance.updated = new Date();
    } else {
      ctx.data.updated = new Date();
    }
    return Promise.resolve();
  }

  if (ctx.instance) {
    //notNewInstance if model.save() inside app, not from API call
    if (ctx.isNewInstance) {
      if (App.isFixturesLoading()) {
        ctx.instance.created = ctx.instance.created ? ctx.instance.created : new Date();
        ctx.instance.updated = ctx.instance.updated ? ctx.instance.updated : new Date();
      } else {
        ctx.instance.created = new Date();
        ctx.instance.updated = new Date();
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
