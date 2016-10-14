import co from 'co';
export function initDelete(Story) {
  Story.iDeleteById = iDeleteById;

  /**
   * This meant to be used during testing, never for production code
   * @param id
   */
  function iDeleteById(id) {
    return co(function*() {
      let story = yield Story.findByIdRequired(id);
      yield Story.deleteById(id);
      yield Story.iSyncAll(story);
    });
  }
}
