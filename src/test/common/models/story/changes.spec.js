import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';

let Story = app.models.Story;
let STORY1 = STORIES.test1;

describe(`models/story/@changes`, function () {
  let updated;
  let story;
  before(function*() {
    let s = yield Story.findById(STORY1.id)
    story = s;
    updated = s.updated;
  });

  it("Story should prevent empty update", function*() {
    yield Story.updateAll({id: STORY1.id}, {});
    let s = yield Story.findById(STORY1.id);
    s.updated.getTime().should.eq(story.updated.getTime());
  });

  it("Story change - updated field should be changed", function*() {
    yield Story.updateAll({id: STORY1.id}, {title: 'just a change'});
    let s = yield Story.findById(STORY1.id);
    s.updated.getTime().should.above(story.updated.getTime());
  });

  after(()=> Story.updateAll({id: STORY1.id}, {title: STORY1.title}));
});
