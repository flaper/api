import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
let expect = require('chai').expect;
let Poll = app.models.Poll;
import POLLS from '../../fixtures/poll';
const COLLECTION_URL = "Polls";
describe(`/${COLLECTION_URL}`, function() {
  updateTimeouts(this);

  describe('DELETE', () => {
    before(function*() {

    })
    it('User should be able to remove his candidancy',function*(){
      let id = POLLS.voteActive.id,
          {agent} = yield user1Promise;
      yield agent.delete(`${COLLECTION_URL}/${id}/candidate`)
      .expect(200);
    })

    it('Users should be able to remove his poll',function*(){
      let id = POLLS.pollActive.id,
          {agent} = yield user1Promise;
      yield agent.put(`${COLLECTION_URL}/${id}/status/delete`)
      .expect(200);
    })

    it('Users should not be able to remove foreign poll',function*(){
      let id = POLLS.pollActive.id,
          {agent} = yield user2Promise;
      yield agent.put(`${COLLECTION_URL}/${id}/status/delete`)
      .expect(403);
    })

  })
})
