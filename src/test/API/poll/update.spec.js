import {api, user1, user1Promise, user2, user2Promise,user3,user3Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import {returnProperties} from '../commonModel/helper';
import app from '../../helpers/app';
let should = require('chai').should();
let expect = require('chai').expect;
let Poll = app.models.Poll,
    User = app.models.User;
import POLLS from '../../fixtures/poll';
const COLLECTION_URL = "Polls";

describe(`/${COLLECTION_URL}`, function() {
  updateTimeouts(this);
  before(function*() {
    let user = yield User.findByIdRequired(user1.id);
        user.storiesNumber = 15;
    yield user.save({skipIgnore:{storiesNumber: true}});
  })
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

    it('User should be able to add/delete his candidancy to election',function*() {
      let id = POLLS.voteActive.id,
          {agent} = yield user1Promise;
      yield agent.post(`${COLLECTION_URL}/${id}/candidate`)
      .expect(200);
      yield agent.delete(`${COLLECTION_URL}/${id}/candidate`)
      .expect(200);
    })

    after(function*() {
      yield returnProperties(User, user1.id, {storiesNumber: 2})
    })

  })
})
