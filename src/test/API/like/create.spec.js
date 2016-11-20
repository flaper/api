import {api, user1, user1Promise, user2Promise, user3Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import sleep from 'co-sleep';
let should = require('chai').should();

import STORIES from  '../../fixtures/story';
let STORY_WITHOUT_LIKES_USER3 = STORIES.withoutLikesUser3;

import COMMENTS from  '../../fixtures/comment';
let COMMENT_WITHOUT_LIKES_USER3 = COMMENTS.withoutLikesUser3;

let {Like, User, Story, Comment} = app.models;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/create`, function () {
  updateTimeouts(this);

  it('Default post should be not found', function*() {
    let {agent} = yield user1Promise;
    yield agent.post(COLLECTION_URL)
      .send({subjectId: STORY_WITHOUT_LIKES_USER3.id})
      .expect(404)
  });

  it('Anonymous - deny to create like', () => {
    return api.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
      .expect(401)
  });

  it('Wrong subjectId should be not found', function*() {
    let {agent} = yield user1Promise;
    yield agent.post(`${COLLECTION_URL}/wrong_id`)
      .expect(404)
  });

  it('User - deny to create like for user model', function*() {
    let {agent} = yield user1Promise;
    yield agent.post(`${COLLECTION_URL}/${user1.id}`)
      .expect(400)
  });

  it('User - deny to like own story', function*() {
    let {agent} = yield user3Promise;
    yield agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
      .expect(400)
  });

  it('Users - allow to create 2 likes for a story, check likesNumber', function*() {
    let userLikesNumber = (yield User.findByIdRequired(STORY_WITHOUT_LIKES_USER3.userId)).likesNumber;
    let {agent} = yield user1Promise;
    yield agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
      .expect(200)
      .expect(response => {
        let res = response.body;
        res.count.should.eq(1);
        res.status.should.eq(Like.RETURN_STATUS.CREATED);
      });
    let likes = yield Like.find({order: 'created DESC', limit: 1});
    likes[0].subjectUserId.should.eq(STORY_WITHOUT_LIKES_USER3.userId);
    agent = (yield user2Promise).agent;
    yield agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
      .expect(200)
      .expect(response => {
        let res = response.body;
        res.count.should.eq(2);
        res.status.should.eq(Like.RETURN_STATUS.CREATED);
      });
    let story = yield Story.findById(STORY_WITHOUT_LIKES_USER3.id);
    story.likesNumber.should.eq(2);
    yield sleep(100);
    let user = yield User.findByIdRequired(STORY_WITHOUT_LIKES_USER3.userId);
    user.likesNumber.should.eq(userLikesNumber + 2);
    yield Like.deleteAll({subjectId: STORY_WITHOUT_LIKES_USER3.id});
    yield Like.iSyncSubject('Story', STORY_WITHOUT_LIKES_USER3.id);
    yield Like.syncUser(STORY_WITHOUT_LIKES_USER3.userId);
    story = yield Story.findById(STORY_WITHOUT_LIKES_USER3.id);
    story.likesNumber.should.eq(0);
  });

  it('User - allow to create like for a comment', function*() {
    let {agent} = yield user1Promise;
    yield agent.post(`${COLLECTION_URL}/${COMMENT_WITHOUT_LIKES_USER3.id}`)
      .expect(200)
      .expect(response => {
        let res = response.body;
        res.count.should.eq(1);
        res.status.should.eq(Like.RETURN_STATUS.CREATED);
      });

    let comment = yield Comment.findById(COMMENT_WITHOUT_LIKES_USER3.id);
    comment.likesNumber.should.eq(1);
    yield Like.deleteAll({subjectId: COMMENT_WITHOUT_LIKES_USER3.id, userId: user1.id});
    yield Like.iSyncSubject('Comment', COMMENT_WITHOUT_LIKES_USER3.id);
    comment = yield Comment.findById(COMMENT_WITHOUT_LIKES_USER3.id);
    comment.likesNumber.should.eq(0);
  });

});
