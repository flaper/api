import co from 'co';
export function initSyncUser(Story) {
  Story.observe('after save', syncUser);

  Story.iSyncUser = iSyncUser;

  function iSyncUser(userId) {
    return co(function*() {
      if (!userId)
        return;
      let User = Story.app.models.user;
      let storiesNumber = yield Story.count({userId: userId, status: Story.STATUS.ACTIVE});
      let level = yield User.calcLevel({userId, storiesNumber});
      yield User.updateAll({id: userId}, {storiesNumber, level},
        {skipIgnore: {storiesNumber: true, level: true}});
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
