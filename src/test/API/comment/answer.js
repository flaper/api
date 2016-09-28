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
  let objectsIdsBefore;
  const NEW_ANSWER = {
    id: '1a5000000000000000010001',
    content: "официальный ответ на инциндент",
    subjectId: REVIEW1.id,
  };

  before(function*(){
    objectsIdsBefore = yield (UserExtra.getObjectsIds(user1.id));
    yield (UserExtra.updateValue(user1.id, 'objects', [REVIEW1.objectId]));
  });

  it('Owner - comment should became answer', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_ANSWER)
      .expect(200)
      .expect(res=>{
         let comment = res.body;
         true.should.eq(comment.isAnswer);
      }));
    let story = yield (Story.findByIdRequired(REVIEW1.id));
    should.exist(story.answer);
    story.answer.id.toString().should.eq(NEW_ANSWER.id);
  });

  after(function*(){
    yield (UserExtra.updateValue(user1.id, 'objects', objectsIdsBefore));
    yield (Comment.deleteById(NEW_ANSWER.id));
    yield (Comment.iSyncSubject('Story', NEW_ANSWER.subjectId));
  });
});
