import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';
import {returnProperties} from '../commonModel/helper'
import _ from 'lodash';

import COMMENTS from  '../../fixtures/comment';
const COMMENT1 = COMMENTS.comment1;
const COMMENT_DELETED1 = COMMENTS.deleted1;

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
    return user1Promise.then(({agent}) => {
        return agent.del(`${COLLECTION_URL}/${COMMENT1.id}`)
          .expect(200)
          .expect((res) => {
            let comment = res.body;
            Comment.STATUS.DELETED.should.equal(comment.status);
          })
      })
      .then(() => returnProperties(Comment, COMMENT1.id, {status: Comment.STATUS.ACTIVE}));
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
      .then(() => returnProperties(Comment, COMMENT1.id, {status: Comment.STATUS.ACTIVE}));
  });
});
