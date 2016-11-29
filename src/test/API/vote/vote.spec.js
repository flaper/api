import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import {returnProperties} from '../commonModel/helper';
import app from '../../helpers/app';
import POLLS from  "../../fixtures/poll";
let should = require('chai').should();
let {Poll, User} = app.models;
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
      let user = yield User.findByIdRequired(user2.id);
      user.storiesNumber = 6;
      user.level = 3;
      user.save({skipIgnore:{storiesNumber:true,level:true}});
    })

    it("Anonymous cant vote", function*(){
      let id = POLLS.voteActive.id;
      yield api.post(`${COLLECTION_URL}/${id}`)
      .send({answer:"ответ"})
      .expect(401);
    })

    it("Users can vote/unvote", function*(){
      let id = POLLS.voteActive.id,
          {agent} = yield user2Promise;
      yield agent.post(`${COLLECTION_URL}/${id}`)
      .send({answer:"1a1000000000000000001001"})
      .expect(200);
      yield agent.delete(`${COLLECTION_URL}/${id}`)
      .expect(200);
    })
    after(function*(){
      yield returnProperties(User, user2.id, {level:0,storiesNumber:3});
    })
  })
})
