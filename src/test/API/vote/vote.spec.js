import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import POLLS from  "../../fixtures/poll";
let should = require('chai').should();
let expect = require('chai').expect;
let Poll = app.models.Poll;
const COLLECTION_URL = "Votes";

describe(`/${COLLECTION_URL}`, function() {
  updateTimeouts(this);

  describe('READ', () => {
    it("Should check existance", function* () {
      let {agent} = yield user1Promise,
          pollId = POLLS.voteActive.id
      return agent.get(`${COLLECTION_URL}/${pollId}/exists`)
      .expect(200)
      .expect(res => {
        let data = res.body;
      })
    })

    it("Should notify of non-existent poll", function*(){
      let id = "someid",
          {agent} = yield user1Promise;
      yield agent.post(`${COLLECTION_URL}/${id}`)
      .send({answer:"ответ"})
      .expect(404);
    });
  });
  describe('CREATE/DELETE', () => {
    before(function*() {
      let Vote = app.models.Vote;
      yield Vote.create({
        userId:user1.id,
        targetId:POLLS.voteActive.id,
        answer:"1a1000000000000000001001"
      });
    })

    it("Anonymous cant vote", function*(){
      let id = POLLS.voteActive.id;
      yield api.post(`${COLLECTION_URL}/${id}`)
      .send({answer:"ответ"})
      .expect(401);
    })

    it.skip("Users can vote", function*(){ //skipped due to currentUser.js issues
      let id = POLLS.voteActive.id,
          {agent} = yield user1Promise;
      yield agent.post(`${COLLECTION_URL}/${id}`)
      .send({answer:"1a1000000000000000001001"})
      .expect(200);
    })

    it("Users can delete their vote", function*(){
      let id = POLLS.voteActive.id,
          {agent} = yield user1Promise;
      yield agent.delete(`${COLLECTION_URL}/${id}`)
      .expect(200);
    })
  })
})
