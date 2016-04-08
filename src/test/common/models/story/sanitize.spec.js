import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import sanitizeHtml from 'sanitize-html';

let Story = app.models.Story;


describe(`models/story/@sanitize`, function () {
  const NEW_STORY = {
    id: '1a4000000000000000010001',
    title: "Title 'with' \"quotes\" <a>inside tag</a>",
    content: "# Header\n" +
    "Second line."
  };

  before(() => {
    NEW_STORY.content = Sanitize.fakerIncreaseAlphaLength(NEW_STORY.content, Story.MIN_CONTENT_LENGTH);
    return Story.create(NEW_STORY);
  });

  it("Should allow quotes in title", () => {
    return Story.findByIdRequired(NEW_STORY.id)
      .then(story => {
        story.title.should.eq("Title 'with' \"quotes\" inside tag");
      })
  });

  after(()=> Story.iDeleteById(NEW_STORY.id));
});
