import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';

let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/@access`, function () {
  updateTimeouts(this);

  describe('GET/HEAD', ()=> {
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
  });
});
