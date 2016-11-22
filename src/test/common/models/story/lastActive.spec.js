import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
let Story = app.models.Story;

describe(`models/story/@lastActive`, function () {
  const NEW_STORY = {
    id: '1a4000000000000000010091',
    type: 'article',
    title: "New story for test",
    content: STORIES.test1.content
  };

  it("Last active should be now", function*() {
    let s = yield Story.create(NEW_STORY);
    should.exist(s.lastActive);
    s.created.getTime().should.eq(s.lastActive.getTime());
  });

  after(function*() {
    yield (Story.iDeleteById(NEW_STORY.id));
  });
});
