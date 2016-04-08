export function initSyncUser(Story) {
  Story.observe('after save', syncUser);

  Story.iSyncUser = iSyncUser;

  function iSyncUser(userId) {
    if (!userId) {
      return Promise.resolve();
    }
    let User = Story.app.models.user;
    let query = {userId: userId, status: Story.STATUS.ACTIVE};
    let count;
    return Story.count(query)
      .then(c => count = c)
      .then((count) => User.updateAll({id: userId}, {storiesNumber: count},
        {skipIgnore: {storiesNumber: true}}))
      .then(() => count);
  }

  function syncUser(ctx) {
    if (!(ctx.instance && ctx.isNewInstance)) {
      return Promise.resolve();
    }
    //for new story we sync user
    return Story.iSyncUser(ctx.instance.userId);
  }
}
