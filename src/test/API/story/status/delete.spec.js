import {user1Promise, user1, user2, user2Promise, adminPromise, admin} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '@flaper/markdown';
import {returnStatus} from './helper';

let Story = app.models.Story;
let User = app.models.User;
const STORY1 = STORIES.test1;
const STORY_DENIED1 = STORIES.denied1;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/:id/status/delete`, function () {
  updateTimeouts(this);
  describe('USER', () => {
    it('User cannot delete foreign story', function*() {
      let {agent} = yield (user2Promise);
      yield (agent.put(`${COLLECTION_URL}/${STORY1.id}/status/delete`)
        .expect(401));
    });

    it('User can delete his active story', function*() {
      let userBefore = yield (User.findByIdRequired(user1.id));
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${STORY1.id}/status/delete`)
        .expect(200)
        .expect(res => {
          let story = res.body;
          story.status.should.be.eq(Story.STATUS.DELETED);
          //there was bug likesNumber disappeared, so let's check it too
          should.exist(story.content);
          should.exist(story.likesNumber);
        }));
      let user = yield (User.findByIdRequired(user1.id));
      user.storiesNumber.should.eq(userBefore.storiesNumber - 1);
      yield (returnStatus(STORY1.id, Story.STATUS.ACTIVE));
      yield (Story.iSyncAll(STORY1));
    });

    it('User can delete his denied story', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${STORY_DENIED1.id}/status/delete`)
        .expect(200)
        .expect(res => {
          let story = res.body;
          story.status.should.be.eq(Story.STATUS.DELETED);
        }));
      yield (returnStatus(STORY_DENIED1.id, Story.STATUS.DENIED));
    });
  });


  describe('ADMIN', () => {
    it('Admin cannot delete foreign active story', function*() {
      let {agent} = yield (adminPromise);
      yield (agent.put(`${COLLECTION_URL}/${STORY1.id}/status/delete`)
        .expect(403));
    });

    it('Admin can delete his active story', function*() {
      const NEW_ADMIN_STORY = {
        id: '1a4000000000000000010010',
        type: 'article',
        title: "New admin story for test",
        content: STORY1.content,
        userId: admin.id
      };
      yield (Story.create(NEW_ADMIN_STORY));
      let {agent} = yield (adminPromise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_ADMIN_STORY.id}/status/delete`)
        .expect(200)
        .expect(res => {
          let story = res.body;
          story.status.should.be.eq(Story.STATUS.DELETED);
        }));
      yield (Story.iDeleteById(NEW_ADMIN_STORY.id));
    });

    it('Admin can delete denied story', function*() {
      let {agent} = yield (adminPromise);
      yield (agent.put(`${COLLECTION_URL}/${STORY_DENIED1.id}/status/delete`)
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.status.should.be.eq(Story.STATUS.DELETED);
        }));
      yield (returnStatus(STORY_DENIED1.id, Story.STATUS.DENIED));
    });
  });
});
