import {user1Promise, user1, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '@flaper/markdown';
import {returnStatus} from './helper';

let Story = app.models.Story;
let User = app.models.User;
const STORY1 = STORIES.test1;
const STORY_DELETED1 = STORIES.deleted1;
const STORY_DENIED1 = STORIES.denied1;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/:id/status/activate`, function () {
  updateTimeouts(this);

  it('User not allowed to activate story', function*() {
    let {agent} = yield user1Promise;
    return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/activate`)
      .expect(401)
  });

  it('Admin cannot activate already active story', function*() {
    let {agent} = yield adminPromise;
    return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/activate`)
      .expect(403)
  });

  it('Admin cannot activate deleted story', function*() {
    let {agent} = yield adminPromise;
    return agent.put(`${COLLECTION_URL}/${STORY_DELETED1.id}/status/activate`)
      .expect(403)
  });

  it('Admin can activate denied story', function*() {
    yield Story.iSyncAll(STORY1);
    let oldUser = yield User.findByIdRequired(user1.id);
    let {agent} = yield adminPromise;
    yield agent.put(`${COLLECTION_URL}/${STORY_DENIED1.id}/status/activate`)
      .expect(200)
      .expect((res) => {
        let story = res.body;
        story.status.should.be.eq(Story.STATUS.ACTIVE);
      });
    let user = yield User.findByIdRequired(user1.id);
    user.storiesNumber.should.eq(oldUser.storiesNumber + 1);
    yield returnStatus(STORY_DENIED1.id, Story.STATUS.DENIED);
    yield Story.iSyncAll(STORY1);
  });
});
