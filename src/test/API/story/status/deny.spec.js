import {user1Promise, user1, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '@flaper/markdown';
import {returnStatus} from './helper';
import {returnProperties} from '../../commonModel/helper'

let Story = app.models.Story;
let User = app.models.user;

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

  it('Admin can deny active story', function*() {
    let oldUser = yield User.findByIdRequired(user1.id);
    let {agent} = yield adminPromise;
    yield agent.put(`${COLLECTION_URL}/${STORY1.id}/status/deny`)
      .expect(200)
      .expect((res) => {
        let story = res.body;
        story.status.should.be.eq(Story.STATUS.DENIED);
      });
    let user = yield User.findByIdRequired(user1.id);
    user.storiesNumber.should.eq(oldUser.storiesNumber - 1);
    yield returnStatus(STORY1.id, Story.STATUS.ACTIVE);
    yield Story.iSyncAll(STORY1);
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
