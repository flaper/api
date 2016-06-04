import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';
import COMMENTS from  '../../fixtures/comment';

const COMMENT1 = COMMENTS.comment1;
const COMMENT_DELETED1 = COMMENTS.deleted1;

let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/GET&HEAD`, function () {
  updateTimeouts(this);

  it('Anonymous - allow access to the list (only active)', () => {
    return api.get(COLLECTION_URL)
      .expect(200)
      .expect((res) => {
        let comments = res.body;
        comments.length.should.least(3);
        comments.forEach(comment => comment.status.should.eq(Comment.STATUS.ACTIVE));
      })
  });

  it('Anonymous - allow count', () => {
    return api.get(`${COLLECTION_URL}/count`)
      .expect(200)
      .expect((res) => {
        let data = res.body;
        data.count.should.least(3);
      })
  });

  it('Anonymous - count deleted should return 0', () => {
    return api.get(`${COLLECTION_URL}/count`)
      .query({where: {status: Comment.STATUS.DELETED}})
      .expect(200)
      .expect((res) => {
        let data = res.body;
        data.count.should.eq(0);
      })
  });

  it('Anonymous - allow access to active by id', () => {
    return api.get(`${COLLECTION_URL}/${COMMENT1.id}`)
      .expect(200)
  });

  it('Admin - cannot read deleted comment', () => {
    return adminPromise.then(({agent}) => {
      return agent.get(`${COLLECTION_URL}/${COMMENT_DELETED1.id}`)
        .expect(404)
    })
  })
});
