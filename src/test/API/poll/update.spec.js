import {api, user1, user1Promise, user2, user2Promise,user3,user3Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
let expect = require('chai').expect;
let Poll = app.models.Poll;
import POLLS from '../../fixtures/poll';
const COLLECTION_URL = "Polls";
describe(`/${COLLECTION_URL}`, function() {
  updateTimeouts(this);

  describe('UPDATE', () => {
    it('Anonymous can not modify the poll ', function*() {
      let id = "1a5000000000000000000003";
      yield api.put(`${COLLECTION_URL}/${id}`)
      .expect(401);
    })

    it.skip('User should not be able to edit another user\'s poll',function*() {
      let id = POLLS.pollActive.id,
          {agent} = yield user3Promise;
      yield agent.put(`${COLLECTION_URL}/${id}`)
      .send({})
      .expect(401);
    })

    it('Admin should be able to edit any poll',function*(){
      let id = POLLS.pollActive.id,
          {agent} = yield adminPromise;
      yield agent.put(`${COLLECTION_URL}/${id}`)
      .expect(200);
    })

    it('Users should be able to add his candidancy to election',function*() {
      let id = POLLS.pollActive.id,
          {agent} = yield user1Promise;
      yield agent.post(`${COLLECTION_URL}/${id}/candidate`)
      .expect(200);
    })


  })
})
