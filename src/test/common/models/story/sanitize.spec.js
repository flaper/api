import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '@flaper/markdown';
import sanitizeHtml from 'sanitize-html';

let Story = app.models.Story;


describe(`models/story/@sanitize`, function () {
  const NEW_STORY = {
    id: '1a4000000000000000010111',
    type: 'article',
    title: "Title 'with' \"quotes\" <a>inside tag</a>",
    content: "# Header\n" +
    "Second line."
  };

  before(() => {
    NEW_STORY.content = Sanitize.fakerIncreaseAlphaLength(NEW_STORY.content, Story.MIN_LENGTH.article);
    return Story.create(NEW_STORY);
  });

  it("Should allow quotes in title", function*() {
    let story = yield Story.findByIdRequired(NEW_STORY.id);
    story.title.should.eq("Title 'with' \"quotes\" inside tag");
  });

  after(function*() {
    yield (Story.iDeleteById(NEW_STORY.id));
  });
});
