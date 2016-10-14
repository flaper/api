export function initDelete(Story) {
  Story.iDeleteById = iDeleteById;

  /**
   * This meant to be used during testing, never for production code
   * @param id
   */
  function* iDeleteById(id) {
    let story = yield (Story.findByIdRequired(id));
    yield (Story.deleteById(id));
    let tasks = [];
    tasks.push(Story.iSyncUser(story.userId));
    tasks.push(Story.iSyncObject(story.objectId));
  }
}
