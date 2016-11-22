import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import {Sanitize} from '@flaper/markdown';
import {returnProperties} from '../commonModel/helper'
import _ from 'lodash';

import COMMENTS from  '../../fixtures/comment';
import STORIES from  '../../fixtures/story';
const COMMENT1 = COMMENTS.comment1;
const COMMENT_DELETED1 = COMMENTS.deleted1;

let Story = app.models.Story;
let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';

describe.only(`/${COLLECTION_URL}/DELETE`, function () {
  updateTimeouts(this);
  it('Anonymous - deny to delete', function* () {
    return api.delete(`${COLLECTION_URL}/${COMMENT1.id}`)
      .expect(401)
  });

  it('User - deny to foreign delete', function* () {
    let {agent} = yield user2Promise;
    return agent.delete(`${COLLECTION_URL}/${COMMENT1.id}`)
      .expect(401)
  });

  it('User - allow to delete his comment', function* () {
    let oldStory = yield Story.findByIdRequired(COMMENT1.subjectId),
        {agent} = yield user1Promise;
    yield agent.delete(`${COLLECTION_URL}/${COMMENT1.id}`)
    .expect(200)
    .expect((res) => {
      let comment = res.body;
      Comment.STATUS.DELETED.should.equal(comment.status);
    });
    let changedStory = yield Story.findByIdRequired(COMMENT1.subjectId);
    changedStory.commentsNumber.should.eq(oldStory.commentsNumber - 1);
    yield returnProperties(Comment, COMMENT1.id, {status: Comment.STATUS.ACTIVE});
    yield Comment.iSyncSubject('Story', COMMENT1.subjectId);
  });

  it('User - deny to delete already deleted comment', function* () {
    let {agent} = yield user1Promise;
    return agent.delete(`${COLLECTION_URL}/${COMMENT_DELETED1.id}`)
      .expect(404)
  });

  it('Admin - allow to delete any comment', function* () {
    let {agent} = yield adminPromise;
    yield agent.delete(`${COLLECTION_URL}/${COMMENT1.id}`)
      .expect(200)
      .expect((res) => {
        let comment = res.body;
        Comment.STATUS.DELETED.should.equal(comment.status);
      });
    yield returnProperties(Comment, COMMENT1.id, {status: Comment.STATUS.ACTIVE});
    yield Comment.iSyncSubject('Story', COMMENT1.subjectId);
  });

  const NEW_COMMENT = {
    id: '1a5000000000000000010002',
    content: "test comment",
    subjectId: STORIES.withoutActiveComments.id
  };

  it('Last active should equal to subject created date, when last comment was removed', function* () {
    let comment = null;
    let story = yield Story.findByIdRequired(NEW_COMMENT.subjectId),
        {agent} = yield user1Promise;
    story.commentsNumber.should.eq(0);

    yield agent.post(`${COLLECTION_URL}`)
      .send(NEW_COMMENT)
      .expect(200)
      .expect((res) => {
        comment = res.body;
        comment.created = new Date(comment.created);
        Comment.STATUS.ACTIVE.should.equal(comment.status);
      });

    story = yield Story.findByIdRequired(NEW_COMMENT.subjectId);
    story.commentsNumber.should.eq(1);
    story.lastActive.getTime().should.eq(comment.created.getTime());

    yield agent.delete(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
      .expect(200);

    story = yield Story.findByIdRequired(NEW_COMMENT.subjectId);
    story.commentsNumber.should.eq(0);
    story.lastActive.getTime().should.eq(story.created.getTime());
    yield Comment.deleteById(NEW_COMMENT.id);
  })
});
