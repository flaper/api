import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
//import STORIES from  '../../fixtures/story';
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';

let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';
//const STORY1 = STORIES.test1;

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
  })
});
