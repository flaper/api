import co from 'co';

export function initSyncAll(Story) {
  Story.iSyncAll = iSyncAll;

  function iSyncAll(story) {
    return co(function*() {
      yield Story.iSyncUser(story.userId);
      if (story.type === Story.TYPE.REVIEW)
        yield Story.iSyncObject(story.objectId);
    });
  }
}
