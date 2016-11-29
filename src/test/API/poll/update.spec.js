import {api, user1, user1Promise, user2, user2Promise, user3, user3Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import {returnProperties} from '../commonModel/helper';
import app from '../../helpers/app';
let should = require('chai').should();
const {Poll, Vote, User} = app.models;
import POLLS from '../../fixtures/poll';
const COLLECTION_URL = "Polls";

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);
  let answersBefore;
  let levelBefore;
  let pollId = POLLS.pollActive.id;

  before(function*() {
    let user = yield User.findByIdRequired(user1.id);
    levelBefore = user.level;
    user.level = 4;
    yield user.save();
    let poll = yield Poll.findByIdRequired(pollId);
    poll.status = Poll.STATUS.ACTIVE; // @todo @hopebetrayer - кто-то портит status до этого, исправить и удалить это
    answersBefore = poll.answers;
    poll.answers = ['user_test_id', 'user_test2_id'];
    yield poll.save();
  })
  describe('UPDATE', () => {
    it('Anonymous can not modify the poll ', function*() {
      yield api.put(`${COLLECTION_URL}/${pollId}`)
        .expect(401);
    });

    it.skip('User should not be able to edit another user\'s poll', function*() {
      let {agent} = yield user3Promise;
      yield agent.put(`${COLLECTION_URL}/${pollId}`)
        .send({})
        .expect(401);
    })

    it('Admin should be able to edit any poll', function*() {
      let {agent} = yield adminPromise;
      yield agent.put(`${COLLECTION_URL}/${pollId}`)
        .expect(200);
    })

    it('User should be able to add/delete his candidancy to election', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(`${COLLECTION_URL}/${pollId}/candidate`)
      .expect(200);
      yield agent.delete(`${COLLECTION_URL}/${pollId}/candidate`)
        .expect(200);
    })

    after(function*() {
      yield returnProperties(User, user1.id, {level: levelBefore});
      yield returnProperties(Poll, pollId, {answers: answersBefore});
    })

  })
})
