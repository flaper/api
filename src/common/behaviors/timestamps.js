export function timestampBehavior(ctx) {
  if (ctx.instance) {
    //next line is for safety reason, maybe excess
    ctx.instance.updated = new Date();
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
    }
  } else {
    //e.g. for update
    ctx.data.updated = new Date();
  }

  return Promise.resolve();
}
