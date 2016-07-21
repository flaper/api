import {api, user1, user1Promise,user2Promise, user3Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();

import STORIES from  '../../fixtures/story';
let STORY_WITHOUT_LIKES_USER3 = STORIES.withoutLikesUser3;

import COMMENTS from  '../../fixtures/comment';
let COMMENT_WITHOUT_LIKES_USER3 = COMMENTS.withoutLikesUser3;

let Like = app.models.Like;
let User = app.models.User;
let Story = app.models.Story;
let Comment = app.models.Comment;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/create`, function () {
  updateTimeouts(this);

  it('Default post should be not found', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send({subjectId: STORY_WITHOUT_LIKES_USER3.id})
        .expect(404)
    })
  });

  it('Anonymous - deny to create like', () => {
    return api.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
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
    return user3Promise.then(({agent}) => {
      return agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
        .expect(400)
    })
  });

  it('Users - allow to create 2 likes for a story, check likesNumber', () => {
    let userLikesNumber;
    return Story.findById(STORY_WITHOUT_LIKES_USER3.id)
      .then(story => story.likesNumber.should.eq(0))
      .then(() => User.findByIdRequired(STORY_WITHOUT_LIKES_USER3.userId))
      .then((user) => userLikesNumber = user.likesNumber)
      .then(() => {
        return user1Promise.then(({agent}) => {
          return agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
            .expect(200)
            .expect(response => {
              let res = response.body;
              res.count.should.eq(1);
              res.status.should.eq(Like.RETURN_STATUS.CREATED);
            })
        })
      })
      .then(() => {
        Like.find({order: 'created DESC', limit: 1})
          .then(likes => likes[0].subjectUserId.should.eq(STORY_WITHOUT_LIKES_USER3.userId))
      })
      .then(() => {
        return user2Promise.then(({agent}) => {
          return agent.post(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
            .expect(200)
            .expect(response => {
              let res = response.body;
              res.count.should.eq(2);
              res.status.should.eq(Like.RETURN_STATUS.CREATED);
            })
        })
      })
      .then(() => Story.findById(STORY_WITHOUT_LIKES_USER3.id))
      .then(story => story.likesNumber.should.eq(2))
      .then(() => new Promise((resolve, reject) => setTimeout(resolve, 100)))
      .then(() => User.findByIdRequired(STORY_WITHOUT_LIKES_USER3.userId))
      .then((user) => user.likesNumber.should.eq(userLikesNumber + 2))
      .then(() => Like.deleteAll({subjectId: STORY_WITHOUT_LIKES_USER3.id}))
      .then(() => Like.iSyncSubject('Story', STORY_WITHOUT_LIKES_USER3.id))
      .then(() => Like.syncUser(STORY_WITHOUT_LIKES_USER3.userId))
      .then(() => Story.findById(STORY_WITHOUT_LIKES_USER3.id))
      .then(story => story.likesNumber.should.eq(0))
  });

  it('User - allow to create like for a comment', () => {
    return user1Promise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${COMMENT_WITHOUT_LIKES_USER3.id}`)
          .expect(200)
          .expect(response => {
            let res = response.body;
            res.count.should.eq(1);
            res.status.should.eq(Like.RETURN_STATUS.CREATED);
          })
      })
      .then(() => Comment.findById(COMMENT_WITHOUT_LIKES_USER3.id))
      .then(comment => comment.likesNumber.should.eq(1))
      .then(() => Like.deleteAll({subjectId: COMMENT_WITHOUT_LIKES_USER3.id, userId: user1.id}))
      .then(() => Like.iSyncSubject('Comment', COMMENT_WITHOUT_LIKES_USER3.id))
      .then(() => Comment.findById(COMMENT_WITHOUT_LIKES_USER3.id))
      .then(comment => comment.likesNumber.should.eq(0))
  });

});
