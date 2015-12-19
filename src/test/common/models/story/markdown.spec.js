import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';

let Story = app.models.Story;


describe(`models/story/@markdown`, function () {
  const NEW_STORY = {
    id: '1a4000000000000000010001',
    title: "New story for test",
    content: "# Header\n" +
    "Second line."
  };

  before(() => {
    NEW_STORY.content = Sanitize.fakerIncreaseAlphaLength(NEW_STORY.content, Story.MIN_CONTENT_LENGTH);
    return Story.create(NEW_STORY);
  });

  it("Should create H1", () => {
    return Story.findByIdRequired(NEW_STORY.id)
      .then(story => {
        let strs = story.contentHTML.split('\n');
        strs[0].should.eq('<h1>Header</h1><p>Second line.</p>');
      })
  });

  after(()=> Story.deleteById(NEW_STORY.id));
});
