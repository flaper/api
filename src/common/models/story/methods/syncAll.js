export function initSyncAll(Story) {
  Story.iSyncAll = iSyncAll;

  function* iSyncAll(story) {
    yield Story.iSyncUser(story.userId);
    if (story.type === Story.TYPE.REVIEW)
      yield Story.iSyncObject(story.objectId);
  }
}
