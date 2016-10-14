import co from 'co';
export function initSyncUser(Story) {
  Story.observe('after save', syncUser);

  Story.iSyncUser = iSyncUser;

  function iSyncUser(userId) {
    return co(function*() {
      if (!userId)
        return;
      let User = Story.app.models.user;
      let query = {userId: userId, status: Story.STATUS.ACTIVE};
      let count = yield Story.count(query);
      yield User.updateAll({id: userId}, {storiesNumber: count},
        {skipIgnore: {storiesNumber: true}});
      return count;
    });
  }

  function* syncUser(ctx) {
    if (!(ctx.instance && ctx.isNewInstance)) {
      return;
    }
    //for new story we sync user
    yield Story.iSyncUser(ctx.instance.userId);
  }
}
