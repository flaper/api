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
    title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
      "ответ 1",
    ]
  },
  wrongTypePoll: {
    type: "shamballa",
    title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
      "ответ 1",
    ]
  },
  questionWith1Answer : {
    type: "question",
    title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
    ]
  },
  questionWith2Answers : {
    type: "question",
    title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
      "ответ 1",
    ]
  },
  questionWith3Answers : {
    type: "question",
    title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
      "ответ 1",
      "ответ 1",
    ]
  },
  pollWith1Answer : {
    type: "poll",
    title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
    ]
  },
  pollWith2Answers : {
    type: "poll",
    title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
      "ответ 1",
    ]
  },
  pollWith3Answers : {
    type: "poll",
      title: "Новый заголовок",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers: [
      "ответ 1",
      "ответ 1",
      "ответ 1",
    ]
  },
  withoutTitle : {
    type: "poll",
    title: "",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers : [
      "ответ 1",
      "ответ 2"
    ]
  },
  withShortTitle: {
    type: "poll",
    title: "Title",
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers : [
      "ответ 1",
      "ответ 2"
    ]
  },
  withLongTitle: {
    type: "poll",
    title: `Title Title Title Title Title Title Title Title Title Title Title Title
    Title Title Title Title Title Title Title Title Title Title`,
    openDate: new Date(2016,10,1),
    closeDate: new Date(2016,10,2),
    answers : [
      "ответ 1",
      "ответ 2"
    ]
  },
  withoutDates: {
    type: "poll",
    title: "Новый заголовок",
    openDate: null,
    closeDate: null,
    answers: [
      "ответ 1",
      "ответ 1",
      "ответ 1",
    ]
  },
  withWrongDates: {
    type: "poll",
    title: "Новый заголовок",
    openDate: new Date(2016,10,2),
    closeDate: new Date(2016,10,1),
    answers: [
      "ответ 1",
      "ответ 1",
      "ответ 1",
    ]
  }
}
describe(`/${COLLECTION_URL}`, function() {
  updateTimeouts(this);

  describe('CREATE', () => {
    it('Anonymous should be unable to create poll', () => {
      return api.post(COLLECTION_URL)
      .expect(401);
    });

    it('Can not create poll without title', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.withoutTitle)
      .expect(422);
    })

    it('Can not create poll with title under 10 chars', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.withShortTitle)
      .expect(400);
    })

    it('Can not create poll with title over 128 chars', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.withLongTitle)
      .expect(400);
    })

    it('Can not create poll without open and close dates', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.withoutDates)
      .expect(422);
    })

    it('Can not create poll with wrong open and close dates', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
      .send(POLLS.withWrongDates)
      .expect(400)
    })

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
