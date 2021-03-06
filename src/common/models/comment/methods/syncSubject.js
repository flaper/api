export function initSyncSubject(Comment) {
  Comment.observe('after save', syncSubject);

  Comment.iSyncSubject = iSyncSubject;

  function iSyncSubject(subjectType, subjectId) {
    let Model = Comment.app.models[subjectType];
    let count;
    let query = {subjectId: subjectId, status: Comment.STATUS.ACTIVE};
    let lastActive = null;
    return Comment.count(query)
      .then((c) => {
        count = c;
        return Comment.findOne({where: query, order: 'created DESC'})
      })
      .then((comment) => {
        lastActive = comment ? comment.created : null;
        if (!lastActive) {
          return Model.findByIdRequired(subjectId)
            .then((model) => {
              lastActive = model.created;
              return comment;
            })
        }
        return comment;
      })
      .then((comment) => Model.updateAll({id: subjectId}, {commentsNumber: count, lastActive: lastActive},
        {skipIgnore: {commentsNumber: true, lastActive: true}}))
      .then(() => count);
  }

  function * syncSubject(ctx) {
    if (!(ctx.instance && ctx.isNewInstance)) {
      return;
    }
    let IdToType = Comment.app.models.IdToType;
    let idToType = yield (IdToType.findByIdRequired(ctx.instance.subjectId));
    //for new comment we sync subject
    return yield (Comment.iSyncSubject(idToType.type, ctx.instance.subjectId));
  }
}
