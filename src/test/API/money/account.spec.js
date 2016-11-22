import {api, user1, user1Promise, user2Promise, adminPromise, superPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
let should = require('chai').should();

const COLLECTION_URL = 'accounts';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  it('Anonymous should not be able to get points', () => {
    return api.get(`${COLLECTION_URL}/${user1.id}`)
      .expect(401)
  });

  it('User should be able to get points', function*() {
    let {agent} = yield user1Promise;
    return agent.get(`${COLLECTION_URL}/${user1.id}`)
      .expect(200)
      .expect(res => {
        let data = res.body;
        should.exist(data.amount);
      });
  });

  describe('Payment', () => {
    let data = {fromId: user1.id, toId: 0, amount: 100};

    it('Anonymous - deny', () => {
      return api.post(`${COLLECTION_URL}/payment`)
        .expect(401)
    });

    it('User1 - deny', function*() {
      let {agent} = yield user1Promise;
      return agent.post(`${COLLECTION_URL}/payment`)
        .expect(401)
    });

    it('Admin - deny', function*() {
      let {agent} = yield adminPromise;
        return agent.post(`${COLLECTION_URL}/payment`)
          .expect(401)
    });

    it('Super - allow', function*() {
      let {agent} = yield superPromise;
      return agent.post(`${COLLECTION_URL}/payment`)
        .send(data)
        .expect(200)
    })
  });

  describe('Transactions', ()=> {
    let url = `${COLLECTION_URL}/${user1.id}/transactions`;
    it('Anonymous - deny', () => {
      return api.get(url)
        .expect(401)
    });

    it('User - deny foreign', function*() {
      let {agent} = yield user2Promise;
        return agent.get(url)
          .expect(403)
    });

    it('User - allow his data', function*() {
      let {agent} = yield user1Promise;
      return agent.get(url)
        .expect(200)
        .expect(res => {
          let transactions = res.body;
          should.exist(transactions);
          transactions.length.should.least(2);
        });
    });

    it('Super - allow', function*() {
      let {agent} = yield superPromise;
      return agent.get(url)
        .expect(200)
        .expect(res => {
          let transactions = res.body;
          should.exist(transactions);
          transactions.length.should.least(2);
        })
    });
  })
});
