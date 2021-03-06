import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '@flaper/markdown';

let Story = app.models.Story;


describe(`models/story/@markdown`, function () {
  const NEW_STORY = {
    id: '1a4000000000000000010101',
    type: 'article',
    title: "New story for test",
    content: "# Header\n" +
    "Second line.\n" +
    "\"Quotes\"\n" +
    "'Single Quotes'\n" +
    "copyright ©↓"
  };

  before(() => {
    NEW_STORY.content = Sanitize.fakerIncreaseAlphaLength(NEW_STORY.content, Story.MIN_LENGTH.article);
    return Story.create(NEW_STORY);
  });

  it("Should create H1 and allow quotes in content", function*() {
    let story = yield Story.findByIdRequired(NEW_STORY.id);
    let strings = story.contentHTML.split('\n');
    strings[0].should.eq('<h1>Header</h1><p>Second line.<br>&quot;Quotes&quot;' +
      '<br>&#39;Single Quotes&#39;<br>copyright ©↓</p>');
    strings = story.content.split('\n');
    strings[0].should.eq('# Header');
    strings[1].should.eq('Second line.');
    strings[2].should.eq('"Quotes"');//double quotes should not be changed in content
    strings[3].should.eq("'Single Quotes'");//single quotes should not be changed in content
    strings[4].should.eq("copyright ©↓");//unicode characters
  });

  after(function*() {
    yield (Story.iDeleteById(NEW_STORY.id));
  });
});
