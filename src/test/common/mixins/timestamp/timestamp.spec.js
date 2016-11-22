import {user1Promise, user1, user2, user2Promise, adminPromise} from '../../../helpers/api';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import moment from 'moment-timezone';

let Story = app.models.Story;
const STORY1 = STORIES.test1;

describe(`Timestamp`, function () {
  it('save() - Created should be ignored when', function*() {
    let created;
    let story = yield  Story.findByIdRequired(STORY1.id)
    created = story.created;
    story = yield story.updateAttributes({created: (new Date()).getTime()});
    created.should.eq(story.created);

  });
});
