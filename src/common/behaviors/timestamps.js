export function timestampBehavior(ctx) {
  if (ctx.instance) {
    ctx.instance.updated = new Date();
    //notNewInstance if model.save() inside app, not from API call
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
    }
  } else {
    //e.g. for update for API
    ctx.data.updated = new Date();
  }

  return Promise.resolve();
}
