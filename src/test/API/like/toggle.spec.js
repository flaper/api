import {api, user1, user1Promise,user2Promise, user3Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();

import STORIES from  '../../fixtures/story';
let STORY_WITHOUT_LIKES_USER3 = STORIES.withoutLikesUser3;

let Like = app.models.Like;
let Story = app.models.Story;
let User = app.models.user;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/toggle`, function () {
  updateTimeouts(this);
  it('Anonymous - deny to toggle like', () => {
    return api.post(`${COLLECTION_URL}/toggle/${STORY_WITHOUT_LIKES_USER3.id}`)
      .expect(401)
  });

  it('Wrong subjectId should be not found', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(`${COLLECTION_URL}/toggle/wrong_id`)
        .expect(404)
    })
  });

  it('User - deny to toggle like for user model', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(`${COLLECTION_URL}/toggle/${user1.id}`)
        .expect(400)
    })
  });

  it('User - deny to toggle own story', () => {
    return user3Promise.then(({agent}) => {
      return agent.post(`${COLLECTION_URL}/toggle/${STORY_WITHOUT_LIKES_USER3.id}`)
        .expect(400)
    })
  });

  it('Users - allow to create 2 likes for a story then toggle them back', () => {
    function toggleLike(userPromise, expectedNumber, status) {
      return userPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/toggle/${STORY_WITHOUT_LIKES_USER3.id}`)
          .expect(200)
          .expect(response => {
            let res = response.body;
            res.count.should.eq(expectedNumber);
            res.status.should.eq(status);
          })
      })
    }

    let userLikesNumber;
    return Story.findById(STORY_WITHOUT_LIKES_USER3.id)
      .then(story => story.likesNumber.should.eq(0))
      .then(() => User.findByIdRequired(STORY_WITHOUT_LIKES_USER3.userId))
      .then((user) => userLikesNumber = user.likesNumber)
      .then(() => toggleLike(user1Promise, 1, Like.RETURN_STATUS.CREATED))
      .then(() => toggleLike(user2Promise, 2, Like.RETURN_STATUS.CREATED))
      .then(() => Story.findById(STORY_WITHOUT_LIKES_USER3.id))
      .then(story => story.likesNumber.should.eq(2))
      .then(() => new Promise((resolve, reject) => setTimeout(resolve, 100)))// to wait async syncUser
      .then(() => User.findById(STORY_WITHOUT_LIKES_USER3.userId))
      .then((user) => user.likesNumber.should.eq(userLikesNumber + 2))
      .then(() => toggleLike(user1Promise, 1, Like.RETURN_STATUS.DELETED))
      .then(() => toggleLike(user2Promise, 0, Like.RETURN_STATUS.DELETED))
      .then(() => Story.findById(STORY_WITHOUT_LIKES_USER3.id))
      .then(story => story.likesNumber.should.eq(0))
      .then(() => new Promise((resolve, reject) => setTimeout(resolve, 100)))
      .then(() => User.findById(STORY_WITHOUT_LIKES_USER3.userId))
      .then((user) => user.likesNumber.should.eq(userLikesNumber))
  });
});
