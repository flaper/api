import {api, user1, user1Promise, user2, user2Promise, adminPromise, admin, superPromise, superUser}
  from '../../helpers/api.js';
import {updateTimeouts} from '../timeout.js';
import app from '../../helpers/app.js';
let should = require('chai').should();
import STORIES from  '../../fixtures/story.js';
import _ from 'lodash';

const {Comment, Story, UserExtra} = app.models;
const REVIEW1 = STORIES.review1;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/@answer`, function () {
  updateTimeouts(this);
  let idsBefore1, idsBefore2;

  const NEW_ANSWER = {
    id: '1a5000000000000000010001',
    content: "официальный ответ на инциндент",
    subjectId: REVIEW1.id
  };

  const NEW_ANSWER2 = {
    id: '1a5000000000000000010002',
    content: "второй ответ на инциндент",
    subjectId: REVIEW1.id
  };

  const NEW_COMMENT = {
    id: '1a5000000000000000010010',
    content: "просто комментарий",
    subjectId: REVIEW1.id
  };

  before(function*() {
    idsBefore1 = yield (UserExtra.getObjectsIds(user1.id));
    idsBefore2 = yield (UserExtra.getObjectsIds(user2.id));
    yield (UserExtra.updateValue(user1.id, 'objects', [REVIEW1.objectId]));
    yield (UserExtra.updateValue(user2.id, 'objects', []));
  });

  it('Comment - should not be an answer', function*() {
    let {agent} = yield (user2Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_COMMENT)
      .expect(200)
      .expect(res=> {
        let comment = res.body;
        should.not.exist(comment.isAnswer);
        comment.status.should.eq(Comment.STATUS.ACTIVE);
      }));
    agent = (yield (user2Promise)).agent;
    yield (agent.del(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
      .send(NEW_COMMENT)
      .expect(200)
      .expect(res=> {
        let comment = res.body;
        comment.status.should.eq(Comment.STATUS.DELETED);
      }));
  });

  it('Owner - comment should became answer', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_ANSWER)
      .expect(200)
      .expect(res=> {
        let comment = res.body;
        true.should.eq(comment.isAnswer);
        comment.status.should.eq(Comment.STATUS.LAST_ANSWER);
      }));
    let story = yield (Story.findByIdRequired(REVIEW1.id));
    should.exist(story.answer);
    story.answer.id.toString().should.eq(NEW_ANSWER.id);
  });

  it('Owner - second answer', function* () {
    // повторный ответ - последний становится официальным, предыдущий обычным комментарием
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_ANSWER2)
      .expect(200)
      .expect(res=> {
        let comment = res.body;
        true.should.eq(comment.isAnswer);
        comment.status.should.eq(Comment.STATUS.LAST_ANSWER);
      }));
    let story = yield (Story.findByIdRequired(REVIEW1.id));
    should.exist(story.answer);
    story.answer.id.toString().should.eq(NEW_ANSWER2.id);
    let answer1 = yield (Comment.findById(NEW_ANSWER.id));
    let answer2 = yield (Comment.findById(NEW_ANSWER2.id));
    let comment = yield (Comment.findById(NEW_COMMENT.id));
    answer1.status.should.eq(Comment.STATUS.ACTIVE);
    answer2.status.should.eq(Comment.STATUS.LAST_ANSWER);
    comment.status.should.eq(Comment.STATUS.DELETED);
  });

  after(function*() {
    yield (UserExtra.updateValue(user1.id, 'objects', idsBefore1));
    yield (UserExtra.updateValue(user2.id, 'objects', idsBefore2));
    yield (Comment.deleteById(NEW_ANSWER.id));
    yield (Comment.deleteById(NEW_ANSWER2.id));
    yield (Comment.iSyncSubject('Story', NEW_ANSWER.subjectId));
  });
});
