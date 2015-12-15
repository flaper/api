import {user1Promise, user1, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';

let Story = app.models.Story;
const STORY1 = STORIES.test1;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/:id/status/delete`, function () {
  updateTimeouts(this);
  describe('USER with active story', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      title: "New story for test",
      content: STORY1.content,
      status: Story.STATUS.ACTIVE,
      userId: user1.id
    };

    before(()=> Story.create(NEW_STORY));

    it('Should be active before', () => {
      return Story.findById(NEW_STORY.id)
        .then(story => {
          story.status.should.eq(Story.STATUS.ACTIVE);
        })
    });

    it('User cannot update foreign status', ()=> {
      return user2Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/delete`)
          .expect(401)
      })
    });

    it('User cannot delete foreign story', ()=> {
      return user2Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/delete`)
          .expect(401)
      })
    });

    it('User can delete his story', ()=> {
      return user1Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/delete`)
          .expect(200)
          .expect((res) => {
            let story = res.body;
            story.status.should.be.eq(Story.STATUS.DELETED);
          })
      })
    });

    after(()=> Story.deleteById(NEW_STORY.id));
  });

  describe('USER with denied story', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      title: "New story for test",
      content: STORY1.content,
      status: Story.STATUS.DENIED,
      userId: user1.id
    };

    before(()=> Story.create(NEW_STORY));

    it('Should be denied before', () => {
      return Story.findById(NEW_STORY.id)
        .then(story => {
          story.status.should.eq(Story.STATUS.DENIED);
        })
    });

    it('User can delete his story', ()=> {
      return user1Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/delete`)
          .expect(200)
          .expect((res) => {
            let story = res.body;
            story.status.should.be.eq(Story.STATUS.DELETED);
          })
      })
    });

    after(()=> Story.deleteById(NEW_STORY.id));
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

    it('Should be active before', () => {
      return Story.findById(NEW_STORY.id)
        .then(story => {
          story.status.should.eq(Story.STATUS.ACTIVE);
        })
    });

    it('Admin cannot delete active story', ()=> {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/delete`)
          .expect(403);
      })
    });

    after(()=> Story.deleteById(NEW_STORY.id));
  });

  describe('ADMIN with denied story', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      title: "New story for test",
      content: STORY1.content,
      status: Story.STATUS.DENIED,
      userId: user1.id
    };

    before(()=> Story.create(NEW_STORY));

    it('Should be denied before', () => {
      return Story.findById(NEW_STORY.id)
        .then(story => {
          story.status.should.eq(Story.STATUS.DENIED);
        })
    });

    it('Admin can delete denied story', ()=> {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}/status/delete`)
          .expect(200)
          .expect((res) => {
            let story = res.body;
            story.status.should.be.eq(Story.STATUS.DELETED);
          })
      })
    });

    after(()=> Story.deleteById(NEW_STORY.id));
  })
});
