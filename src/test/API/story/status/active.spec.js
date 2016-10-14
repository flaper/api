import {user1Promise, user1, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '@flaper/markdown';

let Story = app.models.Story;
const STORY1 = STORIES.test1;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/:id/status/active`, function () {
  updateTimeouts(this);
  describe('Article', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      type: 'article',
      title: "New story for test",
      content: STORY1.content,
      //this should be ignored
      status: Story.STATUS.DELETED
    };

    it('Add - always active status', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.status.should.be.eq(Story.STATUS.ACTIVE);
        }));
    });

    it('Admin - ignore direct status update', function*() {
      let {agent} = yield (adminPromise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
        .send({status: Story.STATUS.DENIED})
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.status.should.be.eq(Story.STATUS.ACTIVE);
        }));
    });

    after(function*() {
      yield (Story.iDeleteById(NEW_STORY.id));
    });
  });
});
