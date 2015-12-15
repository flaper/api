import {user1Promise, user1, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import {returnStatus} from './helper';

let Story = app.models.Story;
const STORY1 = STORIES.test1;
const STORY_DELETED1 = STORIES.deleted1;
const STORY_DENIED1 = STORIES.denied1;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/:id/status/deny`, function () {
  updateTimeouts(this);

  it('User not allowed to deny story', ()=> {
    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/deny`)
        .expect(401)
    })
  });

  it('Admin can deny active story', ()=> {
    return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/deny`)
          .expect(200)
          .expect((res) => {
            let story = res.body;
            story.status.should.be.eq(Story.STATUS.DENIED);
          })
      })
      .then(() => returnStatus(STORY1.id, Story.STATUS.ACTIVE));
  });

  it('Admin cannot deny already denied story', () => {
    return adminPromise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${STORY_DENIED1.id}/status/deny`)
        .expect(403)
    })
  });


  it('Admin cannot deny deleted story', ()=> {
    return adminPromise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${STORY_DELETED1.id}/status/deny`)
        .expect(403)
    })
  });
});
