export function initSyncSubject(Comment) {
  Comment.observe('after save', syncSubject);

  Comment.updateSubject = updateSubject;

  function updateSubject(subjectType, id) {
    let Model = Comment.app.models[subjectType];
    let count;
    let query = {subjectId: id, status: Comment.STATUS.ACTIVE};
    let lastActive = null;
    return Comment.count(query)
      .then((c) => {
        count = c;
        return Comment.findOne({where: query, order: 'created DESC'})
      })
      .then((comment) => {
        lastActive = comment ? comment.created : null;
        if (!lastActive) {
          return Model.findByIdRequired(id)
            .then((model) => {
              lastActive = model.created;
              return comment;
            })
        }
        return comment;
      })
      .then((comment) => Model.updateAll({id: id}, {commentsNumber: count, lastActive: lastActive},
        {skipIgnore: {commentsNumber: true, lastActive: true}}))
      .then(() => count);
  }

  function syncSubject(ctx) {
    if (!(ctx.instance && ctx.isNewInstance)) {
      return Promise.resolve();
    }
    //for new comment we sync subject
    return Comment.updateSubject('Story', ctx.instance.subjectId);
  }
}
