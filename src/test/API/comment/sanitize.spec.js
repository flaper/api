import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import {Sanitize} from '@flaper/markdown';
import _ from 'lodash';
import STORIES from  '../../fixtures/story.js';
const STORY1 = STORIES.test1;

const {Comment} = app.models;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/@sanitize`, function () {
  updateTimeouts(this);

  const NEW_COMMENT = {
    id: '1a5000000000000000010001',
    content: '    \'test\'<b> "comment"</b>',
    subjectId: STORY1.id,
  };

  it('Comment should be sanitized', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_COMMENT)
      .expect(200)
      .expect((res) => {
	let comment = res.body;
	'\'test\' "comment"'.should.eq(comment.content);
      }));
  });

  after(function*() {
    yield (Comment.deleteById(NEW_COMMENT.id));
    yield (Comment.iSyncSubject('Story', NEW_COMMENT.subjectId));
  });
});
