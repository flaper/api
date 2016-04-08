import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';
import _ from 'lodash';

let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/@sanitize`, function () {
  updateTimeouts(this);

  const NEW_COMMENT = {
    id: '1a5000000000000000010001',
    content: '    \'test\'<b> "comment"</b>',
    subjectId: "1a4000000000000000001001"
  };

  it('Comment should be sanitized', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(NEW_COMMENT)
        .expect(200)
        .expect((res) => {
          let comment = res.body;
          '\'test\' "comment"'.should.eq(comment.content);
        })
    })
  });

  after(()=> {
    return Comment.deleteById(NEW_COMMENT.id)
      .then(Comment.iSyncSubject('Story', NEW_COMMENT.subjectId))
  });
});
