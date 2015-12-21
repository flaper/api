//if used as mixins for common-model inheritance create double call for this method
//seems loopback doesn't handle mixins inheritance properly
export function timestampBehavior(ctx) {
  if (ctx.instance) {
    ctx.instance.updated = new Date();
    //notNewInstance if model.save() inside app, not from API call
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
    }
  } else {
    //updateAttributes / REST call
    //e.g. for update for API
    ctx.data.updated = new Date();
    delete ctx.data.created;
  }

  return Promise.resolve();
}
