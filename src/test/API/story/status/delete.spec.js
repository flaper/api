import {user1Promise, user1, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import {returnStatus} from './helper';

let Story = app.models.Story;
let User = app.models.User;
const STORY1 = STORIES.test1;
const STORY_DENIED1 = STORIES.denied1;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/:id/status/delete`, function () {
  updateTimeouts(this);
  describe('USER', () => {
    it('User cannot delete foreign story', ()=> {
      return user2Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/delete`)
          .expect(401)
      })
    });

    it('User can delete his active story', ()=> {
      let storiesNumberBefore;
      return User.findByIdRequired(user1.id)
        .then(user => storiesNumberBefore = user.storiesNumber)
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/delete`)
              .expect(200)
              .expect((res) => {
                let story = res.body;
                story.status.should.be.eq(Story.STATUS.DELETED);
                //there was bug numberOfLikes disappeared, so let's check it too
                should.exist(story.content);
                should.exist(story.numberOfLikes);
              })
          })
        })
        .then(() => User.findByIdRequired(user1.id))
        .then(user => user.storiesNumber.should.eq(storiesNumberBefore - 1))
        .then(() => returnStatus(STORY1.id, Story.STATUS.ACTIVE))
        .then(() => Story.iSyncUser(STORY1.userId))
    });

    it('User can delete his denied story', ()=> {
      return user1Promise.then(({agent}) => {
          return agent.put(`${COLLECTION_URL}/${STORY_DENIED1.id}/status/delete`)
            .expect(200)
            .expect((res) => {
              let story = res.body;
              story.status.should.be.eq(Story.STATUS.DELETED);
            })
        })
        .then(() => returnStatus(STORY_DENIED1.id, Story.STATUS.DENIED));
    });
  });


  describe('ADMIN', () => {
    it('Admin cannot delete active story', ()=> {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${STORY1.id}/status/delete`)
          .expect(403);
      })
    });

    it('SomethingAdmin can delete denied story', ()=> {
      return adminPromise.then(({agent}) => {
          return agent.put(`${COLLECTION_URL}/${STORY_DENIED1.id}/status/delete`)
            .expect(200)
            .expect((res) => {
              let story = res.body;
              story.status.should.be.eq(Story.STATUS.DELETED);
            })
        })
        .then(() => returnStatus(STORY_DENIED1.id, Story.STATUS.DENIED));
    });
  });
});
