import {api, user1, user1Promise, user2, user2Promise, adminPromise, superPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';

let {Account, StoryBest} = app.models;

let STORY1 = STORIES.test1;
let STORY2 = STORIES.test2;

const COLLECTION_URL = 'StoryBests';

describe(`${COLLECTION_URL}`, function () {
  updateTimeouts(this);
  let moneyBefore;
  before(function*() {
    moneyBefore = yield (Account.getAccountById(STORY1.userId));
  });

  let PLACE1 = {
    place: 1,
    id: STORY1.id
  };

  let PLACE2 = {
    place: 2,
    id: STORY2.id
  };

  it('Get current winners', function*() {
    yield (api.get(COLLECTION_URL)
      .expect(200)
      .expect(res => {
        let bests = res.body;
        bests.length.should.eq(0);
      }));
  });

  it('User - deny to add', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(PLACE1)
      .expect(401));
  });

  it('Admin - deny to add', function* () {
    let {agent} = yield (adminPromise);
    yield (agent.post(COLLECTION_URL)
      .send(PLACE1)
      .expect(401));
  });

  it('Super - deny to add with wrong id', function*() {
    let {agent} = yield (superPromise);
    yield (agent.post(COLLECTION_URL)
      .send({place: 1, id: '000000000000000000000001'})
      .expect(404));
  });

  it('Super - deny to add with wrong place', function*() {
    let {agent} = yield (superPromise);
    yield (agent.post(COLLECTION_URL)
      .send({place: 5, id: STORY1.id})
      .expect(400));
  });

  it('Super - add best story', function*() {
    let {agent} = yield (superPromise);
    yield (agent.post(COLLECTION_URL)
      .send(PLACE1)
      .expect(200)
      .expect(res => {
        let data = res.body;
        PLACE1.id.should.eq(data.id);
      }));
    let amount = yield (Account.getAccountById(STORY1.userId));
    amount.should.eq(moneyBefore + StoryBest.PRIZES[1]);
    yield (api.get(COLLECTION_URL)
      .expect(200)
      .expect(res => {
        let bests = res.body;
        bests.length.should.eq(1);
      }));
  });

  it('Super - cannot add same place twice', function*() {
    let {agent} = yield (superPromise);
    yield (agent.post(COLLECTION_URL)
      .send({id: STORY2.id, place: 1})
      .expect(400));
  });

  it('Super - add second place', function* () {
    let {agent} = yield (superPromise);
    yield (agent.post(COLLECTION_URL)
      .send(PLACE2)
      .expect(200)
      .expect(res => {
        let data = res.body;
        PLACE2.id.should.eq(data.id);
      }));
  });

  it('Previous winners - 0 weeks ago', function*() {
    yield (api.get(`${COLLECTION_URL}/0`)
      .expect(200)
      .expect(res => {
        let bests = res.body;
        bests.length.should.eq(2);
      }));
  });

  it('Previous winners - 1 weeks ago', function*() {
    yield (api.get(`${COLLECTION_URL}/1`)
      .expect(200)
      .expect(res => {
        let bests = res.body;
        bests.length.should.eq(0);
      }));
  });

  after(()=> StoryBest.deleteAll());
});
