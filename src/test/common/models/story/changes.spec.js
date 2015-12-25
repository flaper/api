import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import {propertiesFilter, getOwnPropertiesNamesFilter} from '../../../../common/utils/object';

let Story = app.models.Story;
let STORY1 = STORIES.test1;


describe(`models/story/@changes`, function () {
  let updated;
  let story;
  before(() => {
    return Story.findById(STORY1.id)
      .then(s => {
        story = s;
        updated = s.updated;
      });
  });

  it("Story should prevent empty update", () => {
    return Story.updateAll({id: STORY1.id}, {})
      .then(() => Story.findById(STORY1.id))
      .then((s) => {
        s.updated.getTime().should.eq(story.updated.getTime())
      })
  });

  it("Story change - updated field should be changed", () => {
    return Story.updateAll({id: STORY1.id}, {title: 'just a change'})
      .then(() => Story.findById(STORY1.id))
      .then((s) => {
        s.updated.getTime().should.above(story.updated.getTime())
      })
  });

  after(()=> Story.updateAll({id: STORY1.id}, {title: STORY1.title}));
});
