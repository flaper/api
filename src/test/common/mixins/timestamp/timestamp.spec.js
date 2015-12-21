import {user1Promise, user1, user2, user2Promise, adminPromise} from '../../../helpers/api';
import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import moment from 'moment-timezone';

let Story = app.models.Story;
const STORY1 = STORIES.test1;

describe(`Timestamp`, function () {
  it('save() - Created should be ignored when', () => {
    let created;
    return Story.findByIdRequired(STORY1.id)
      .then(story => {
        created = story.created;
        return story.updateAttributes({created: (new Date()).getTime()});
      })
      .then(story => {
        created.should.eq(story.created);
      })

  });
});
