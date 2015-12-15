import {user1Promise, user1, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';

let Story = app.models.Story;
const STORY1 = STORIES.test1;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/:id/status/deny`, function () {
  updateTimeouts(this);

  it('User not allowed to deny story', ()=> {
    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/deny`)
        .expect(401)
    })
  });


  describe('ADMIN with active story', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      title: "New story for test",
      content: STORY1.content,
      status: Story.STATUS.ACTIVE,
      userId: user1.id
    };
    before(()=> Story.create(NEW_STORY));

    it('Admin can deny active story', ()=> {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/deny`)
          .expect(200)
          .expect((res) => {
            let story = res.body;
            story.status.should.be.eq(Story.STATUS.DENIED);
          })
      })
    });

    it('Admin cannot deny already denied story', () => {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/deny`)
          .expect(403)
      })
    });

    after(()=> Story.deleteById(NEW_STORY.id));
  });

  describe('ADMIN with deleted story', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      title: "New story for test",
      content: STORY1.content,
      status: Story.STATUS.DELETED,
      userId: user1.id
    };

    before(()=> Story.create(NEW_STORY));

    it('Admin cannot deny deleted story', ()=> {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/deny`)
          .expect(403)
      })
    });

    after(()=> Story.deleteById(NEW_STORY.id));
  })
});
