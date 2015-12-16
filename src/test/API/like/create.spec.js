import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();

import STORIES from  '../../fixtures/story';
let STORY_WITHOUT_LIKES2 = STORIES.withoutLikes2;

import COMMENTS from  '../../fixtures/comment';
let COMMENT_WITHOUT_LIKES2 = COMMENTS.withoutLikes2;

let Like = app.models.Like;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/create`, function () {
  updateTimeouts(this);

  it('Default post should be not found', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send({subjectId: STORY_WITHOUT_LIKES2.id})
        .expect(404)
    })
  });

  it('Anonymous - deny to create like', () => {
    return api.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES2.id}`)
      .expect(401)
  });

  it('Wrong subjectId should be not found', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(`${COLLECTION_URL}/wrong_id`)
        .expect(404)
    })
  });

  it('User - deny to create like for user model', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(`${COLLECTION_URL}/${user1.id}`)
        .expect(400)
    })
  });

  it('User - deny to like own story', () => {
    return user2Promise.then(({agent}) => {
      return agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES2.id}`)
        .expect(400)
    })
  });

  it('User - allow to create like for a story', () => {
    return user1Promise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES2.id}`)
          .expect(200)
          .expect(res => {
            let like = res.body;
            STORY_WITHOUT_LIKES2.id.should.eq(like.subjectId);
            'Story'.should.eq(like.subjectType);
          })
      })
      .then(() => Like.deleteAll({subjectId: STORY_WITHOUT_LIKES2.id, userId: user1.id}))
  });

  it('User - allow to create like for a comment', () => {
    return user1Promise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${COMMENT_WITHOUT_LIKES2.id}`)
          .expect(200)
          .expect(res => {
            let like = res.body;
            COMMENT_WITHOUT_LIKES2.id.should.eq(like.subjectId);
            'Comment'.should.eq(like.subjectType);
          })
      })
      .then(() => Like.deleteAll({subjectId: COMMENT_WITHOUT_LIKES2.id, userId: user1.id}))
  });

});
