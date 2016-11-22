import {api, user1, user1Promise,user2Promise, user3Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
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

  it('Wrong subjectId should be not found', function*() {
    let {agent} = yield user1Promise;
      return agent.post(`${COLLECTION_URL}/toggle/wrong_id`)
        .expect(404)
  });

  it('User - deny to toggle like for user model', function*() {
    let {agent} = yield user1Promise;
      return agent.post(`${COLLECTION_URL}/toggle/${user1.id}`)
        .expect(400)
  });

  it('User - deny to toggle own story', function*() {
    let {agent} = yield user3Promise;
      return agent.post(`${COLLECTION_URL}/toggle/${STORY_WITHOUT_LIKES_USER3.id}`)
        .expect(400)
  });

  it('Users - allow to create 2 likes for a story then toggle them back', function*() {
    function* toggleLike(userPromise, expectedNumber, status) {
      let {agent} = yield userPromise;
        return agent.post(`${COLLECTION_URL}/toggle/${STORY_WITHOUT_LIKES_USER3.id}`)
          .expect(200)
          .expect(response => {
            let res = response.body;
            res.count.should.eq(expectedNumber);
            res.status.should.eq(status);
          })
    }

    let story = yield Story.findById(STORY_WITHOUT_LIKES_USER3.id);
    story.likesNumber.should.eq(0);
    let {likesNumber} = yield User.findByIdRequired(STORY_WITHOUT_LIKES_USER3.userId);
    yield toggleLike(user1Promise, 1, Like.RETURN_STATUS.CREATED);
    yield toggleLike(user2Promise, 2, Like.RETURN_STATUS.CREATED);
    story = yield Story.findById(STORY_WITHOUT_LIKES_USER3.id);
    yield new Promise( (resolve,reject) => setTimeout(resolve,100));
    story.likesNumber.should.eq(2);
    let user = yield User.findById(STORY_WITHOUT_LIKES_USER3.userId);
    user.likesNumber.should.eq(likesNumber + 2);
    yield toggleLike(user1Promise, 1, Like.RETURN_STATUS.DELETED);
    yield toggleLike(user2Promise, 0, Like.RETURN_STATUS.DELETED);
    story = yield Story.findById(STORY_WITHOUT_LIKES_USER3.id);
    yield new Promise( (resolve,reject) => setTimeout(resolve,100));
    story.likesNumber.should.eq(0);
    user = yield User.findById(STORY_WITHOUT_LIKES_USER3.userId);
    return user.likesNumber.should.eq(likesNumber);
  });
});
