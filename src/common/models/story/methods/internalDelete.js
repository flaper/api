export function initDelete(Story) {
  Story.iDeleteById = iDeleteById;

  function iDeleteById(id) {
    let story = null;
    return Story.findByIdRequired(id)
      .then(s => story = s)
      .then(() => Story.deleteById(id))
      .then(() => Story.iSyncUser(story.userId))
  }
}
