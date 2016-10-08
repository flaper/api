import {api, user1, user1Promise, user2, user2Promise, adminPromise, superPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import wait from 'co-wait';

let {Story, Audit} = app.models;
let STORY1 = STORIES.test1;

const COLLECTION_URL = 'stories';

describe(`${COLLECTION_URL}/@audit`, function () {
  updateTimeouts(this);

  const NEW_STORY = {
    id: '1a4000000000000000010001',
    type: 'article',
    title: "New story for test",
    content: STORY1.content
  };

  before(function* () {
    yield Audit.deleteAll({subjectId: NEW_STORY.id});
  });

  it('User - create story should create 0 audits', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_STORY)
      .expect(200));
    let audits = yield (Audit.find({where: {subjectId: NEW_STORY.id}}));
    audits.length.should.eq(0);
  });

  it('User - update should create 2 audits', function*() {
    let newTitle = 'another title';
    let {agent} = yield (user1Promise);
    yield (agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
      .send({title: newTitle})
      .expect(200));
    // yield wait(100);
    let audits = yield (Audit.find({where: {subjectId: NEW_STORY.id}}));
    let story = yield (Story.findById(NEW_STORY.id));
    audits.length.should.eq(2);
    audits[0].created.getTime().should.eq(story.created.getTime());
    audits[1].created.getTime().should.above(story.created.getTime());
    Object.keys(audits[0].fields.__data).length.should.least(5);
    let change = audits[1].fields.__data;
    Object.keys(change).length.should.eq(1);
    should.exist(change.title);
    change.title.should.eq(newTitle);
  });

  it('User - second update should create 1 audit', function*() {
    let newTitle = 'another title2';
    let {agent} = yield (user1Promise);
    yield (agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
      .send({title: newTitle})
      .expect(200));
    // yield wait(100);
    let audits = yield (Audit.find({where: {subjectId: NEW_STORY.id}}));
    audits.length.should.eq(3);
  });

  it('Story audit method should return 3 changes', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.get(`${COLLECTION_URL}/${NEW_STORY.id}/audit`)
        .expect(200)
        .expect(res=> {
          let changes = res.body;
          changes.length.should.eq(3);
        })
    );
  });

  after(function*() {
    yield ([Story.iDeleteById(NEW_STORY.id)]);
  })
});
