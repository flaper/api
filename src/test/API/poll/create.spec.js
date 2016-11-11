import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
let expect = require('chai').expect;
let Poll = app.models.Poll;
const COLLECTION_URL = "Polls";
const POLLS = {
  newPoll : {
    type: "poll",
    id: "1a4000000000000000020061",
    answers: [
      {text:"ответ 1"},
      {text:"ответ 1"},
    ]
  },
  wrongTypePoll: {
    type: "shamballa",
    id: "1a4000000000000000020062",
    answers: [
      {text:"ответ 1"},
      {text:"ответ 1"},
    ]
  },
  questionWith1Answer : {
    type: "question",
    id: "1a4000000000000000020063",
    answers: [
      {text:"ответ 1"},
    ]
  },
  questionWith2Answers : {
    type: "question",
    id: "1a4000000000000000020064",
    answers: [
      {text:"ответ 1"},
      {text:"ответ 1"},
    ]
  },
  questionWith3Answers : {
    type: "question",
    id: "1a4000000000000000020065",
    answers: [
      {text:"ответ 1"},
      {text:"ответ 1"},
      {text:"ответ 1"},
    ]
  },
  pollWith1Answer : {
    type: "poll",
    id: "1a4000000000000000020066",
    answers: [
      {text:"ответ 1"},
    ]
  },
  pollWith2Answers : {
    type: "poll",
    id: "1a4000000000000000020067",
    answers: [
      {text:"ответ 1"},
      {text:"ответ 1"},
    ]
  },
  pollWith3Answers : {
    type: "poll",
    id: "1a4000000000000000020068",
    answers: [
      {text:"ответ 1"},
      {text:"ответ 1"},
      {text:"ответ 1"},
    ]
  },
}
describe(`/${COLLECTION_URL}`, function() {
  updateTimeouts(this);

  describe('CREATE', () => {
    it('Anonymous should be unable to create poll', () => {
      return api.post(COLLECTION_URL)
      .expect(401);
    });

    it('User should be able to create poll', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.newPoll)
      .expect(200)
      .expect(res => {
        let data =res.body;
        expect(data.status).to.be.equal(Poll.STATUS.ACTIVE);
      });
    })

    it('Should not be able to create poll of wrong type', function*() {
      let {agent} = yield user1Promise;
      let poll = POLLS.pollActive;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.wrongTypePoll)
      .expect(400)
    })

    it('Poll should have at least 2 answers', function*() {
      let {agent} = yield user1Promise;
      let poll = POLLS.pollActive;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.pollWith1Answer)
      .expect(400);
      yield agent.post(COLLECTION_URL)
      .send(POLLS.pollWith2Answers)
      .expect(200);
      yield agent.post(COLLECTION_URL)
      .send(POLLS.pollWith3Answers)
      .expect(200);
    })

    it('Question should have exactly 2 answers', function*() {
      let {agent} = yield user1Promise;
      let poll = POLLS.pollActive;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.questionWith1Answer)
      .expect(400);
      yield agent.post(COLLECTION_URL)
      .send(POLLS.questionWith2Answers)
      .expect(200);
      yield agent.post(COLLECTION_URL)
      .send(POLLS.questionWith3Answers)
      .expect(400);
    })

  })
})
