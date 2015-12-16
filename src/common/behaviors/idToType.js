function createIdToType(ctx) {
  if (ctx.instance && ctx.isNewInstance) {
    let modelName = ctx.Model.sharedClass.name;
    let IdToType = ctx.Model.app.models.IdToType;
    return IdToType.create({id: ctx.instance.id, type: modelName})
  }
  return Promise.resolve()
}

function deleteIdToType(ctx) {
  if (ctx.where && ctx.where.id) {
    let IdToType = ctx.Model.app.models.IdToType;
    return IdToType.deleteById(ctx.where.id);
  }
  //maybe we should support deleteAll too
  return Promise.resolve()
}

export function applyIdToType(Model) {
  Model.observe('after save', createIdToType);
  Model.observe('after delete', deleteIdToType);
}
