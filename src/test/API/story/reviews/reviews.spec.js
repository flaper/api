import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import _ from 'lodash';

let Story = app.models.Story;
let User = app.models.user;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@reviews`, function () {
  updateTimeouts(this);

  describe('PUT/POST', () => {
    const NEW_REVIEW = {
      id: '1a4000000000000000010001',
      type: 'review',
      title: "New story for test",
      content: Sanitize.fakerIncreaseAlphaLength("test review", 256),
      //this userId should be ignored
      userId: '1a400000000000000001111'
    };

    it('User - deny to add to short review', () => {
      return user1Promise.then(({agent}) => {
        return agent.post(COLLECTION_URL)
          .send(_.assign({}, NEW_REVIEW, {content: 'too short'}))
          .expect(400)
      })
    });

    it('User - allow to add', () => {
      let storiesNumberBefore;
      return User.findByIdRequired(user1.id)
        .then(user => storiesNumberBefore = user.storiesNumber)
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.post(COLLECTION_URL)
              .send(NEW_REVIEW)
              .expect(200)
              .expect((res) => {
                let story = res.body;
                user1.id.should.equal(story.userId);
                Story.STATUS.ACTIVE.should.equal(story.status);
              })
          })
        })
        .then(() => User.findByIdRequired(user1.id))
        .then(user => user.storiesNumber.should.eq(storiesNumberBefore + 1))
    });

    it('User - deny to update to with short string', () => {
      return user1Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_REVIEW.id}`)
          .send({content: 'too short'})
          .expect(400)
      });
    });

    after(()=> Story.iDeleteById(NEW_REVIEW.id));
  });
});
