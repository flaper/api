import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
let Story = app.models.Story;

describe(`models/story/@lastActive`, function () {
  const NEW_STORY = {
    id: '1a4000000000000000010001',
    title: "New story for test",
    content: STORIES.test1.content
  };

  it("Last active should be now", () => {
    return Story.create(NEW_STORY)
      .then((s) => {
        should.exist(s.lastActive);
        s.created.getTime().should.eq(s.lastActive.getTime());
      })
  });

  after(()=> Story.deleteById(NEW_STORY.id));
});