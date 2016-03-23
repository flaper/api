import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';
import {returnProperties} from '../commonModel/helper'
import _ from 'lodash';

import COMMENTS from  '../../fixtures/comment';
import STORIES from  '../../fixtures/story';
const COMMENT1 = COMMENTS.comment1;
const COMMENT_DELETED1 = COMMENTS.deleted1;

let Story = app.models.Story;
let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/DELETE`, function () {
  updateTimeouts(this);
  it('Anonymous - deny to delete', () => {
    return api.del(`${COLLECTION_URL}/${COMMENT1.id}`)
      .expect(401)
  });

  it('User - deny to foreign delete', () => {
    return user2Promise.then(({agent}) => {
      return agent.del(`${COLLECTION_URL}/${COMMENT1.id}`)
        .expect(401)
    });
  });

  it('User - allow to delete his comment', () => {
    let oldStory = null;
    return Story.findByIdRequired(COMMENT1.subjectId)
      .then(story => oldStory = story)
      .then(() => {
        return user1Promise.then(({agent}) => {
          return agent.del(`${COLLECTION_URL}/${COMMENT1.id}`)
            .expect(200)
            .expect((res) => {
              let comment = res.body;
              Comment.STATUS.DELETED.should.equal(comment.status);
            })
        })
      }).then(() =>  Story.findByIdRequired(COMMENT1.subjectId))
      .then(story => story.commentsNumber.should.eq(oldStory.commentsNumber - 1))
      .then(() => returnProperties(Comment, COMMENT1.id, {status: Comment.STATUS.ACTIVE}))
      .then(() => Comment.updateSubject('Story', COMMENT1.subjectId))
  });

  it('User - deny to delete already deleted comment', () => {
    return user1Promise.then(({agent}) => {
      return agent.del(`${COLLECTION_URL}/${COMMENT_DELETED1.id}`)
        .expect(404)
    })
  });

  it('Admin - allow to delete any comment', () => {
    return adminPromise.then(({agent}) => {
        return agent.del(`${COLLECTION_URL}/${COMMENT1.id}`)
          .expect(200)
          .expect((res) => {
            let comment = res.body;
            Comment.STATUS.DELETED.should.equal(comment.status);
          })
      })
      .then(() => returnProperties(Comment, COMMENT1.id, {status: Comment.STATUS.ACTIVE}))
      .then(() => Comment.updateSubject('Story', COMMENT1.subjectId))
  });

  const NEW_COMMENT = {
    id: '1a5000000000000000010002',
    content: "test comment",
    subjectId: STORIES.withoutActiveComments.id
  };

  it('Last active should equal to subject created date, when last comment was removed', () => {
    let comment = null;
    return Story.findByIdRequired(NEW_COMMENT.subjectId)
      .then(story => {
        story.commentsNumber.should.eq(0)
      })
      .then(() => user1Promise)
      .then(({agent}) => {
        return agent.post(`${COLLECTION_URL}`)
          .send(NEW_COMMENT)
          .expect(200)
          .expect((res) => {
            comment = res.body;
            comment.created = new Date(comment.created);
            Comment.STATUS.ACTIVE.should.equal(comment.status);
          })
      })
      .then(() =>  Story.findByIdRequired(NEW_COMMENT.subjectId))
      .then((story) => {
        story.commentsNumber.should.eq(1);
        story.lastActive.getTime().should.eq(comment.created.getTime());
      })
      .then(() => user1Promise)
      .then(({agent}) => {
        return agent.del(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
          .expect(200)
      })
      .then(() =>  Story.findByIdRequired(NEW_COMMENT.subjectId))
      .then((story) => {
        story.commentsNumber.should.eq(0);
        story.lastActive.getTime().should.eq(story.created.getTime());
      })
      .then(() => Comment.deleteById(NEW_COMMENT.id))
  })
});
