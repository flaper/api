import {api, user1,user2,user3, user1Promise,user2Promise, user3Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();

import STORIES from  '../../fixtures/story';
let STORY_WITHOUT_LIKES_USER3 = STORIES.withoutLikesUser3;

import COMMENTS from  '../../fixtures/comment';
let COMMENT_WITHOUT_LIKES_USER3 = COMMENTS.withoutLikesUser3;

const {User, Subscription} = app.models;
const COLLECTION_URL = 'subscriptions';

describe(`/${COLLECTION_URL}/create`, function () {
  updateTimeouts(this);

  it('Anonymous - deny to subscribe', () => {
    return api.post(`${COLLECTION_URL}/${user1.id}`)
      .expect(401)
  });

  it('Wrong targetId should be not found', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(`${COLLECTION_URL}/wrong_id`)
        .expect(404));
  });

  it('User - deny to create subscription to model story', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
        .expect(400));
  });

  it('User - deny to create subscription to model comment', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(`${COLLECTION_URL}/${COMMENT_WITHOUT_LIKES_USER3.id}`)
      .expect(400))
  });


  it('User - deny to subscibe to self', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(`${COLLECTION_URL}/${user1.id}`)
      .expect(400));
  });

  it('User - allow Subscription', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(`${COLLECTION_URL}/${user2.id}`)
      .expect(200));
  });

  after(function*() {
    yield (Subscription.deleteAll({userId: user1.id, targetId: user2.id}));
  });
});
