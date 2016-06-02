import {api, user1, user1Promise,adminPromise, superPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
let should = require('chai').should();

const COLLECTION_URL = 'accounts';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  it('Anonymous should not be able to get points', () => {
    return api.get(`${COLLECTION_URL}/${user1.id}`)
      .expect(401)
  });

  it('User should be able to get points', () => {
    return user1Promise.then(({agent}) => {
      return agent.get(`${COLLECTION_URL}/${user1.id}`)
        .expect(200)
        .expect(res => {
          let data = res.body;
          should.exist(data.amount);
        })
    });
  });

  describe('Payment', () => {
    let data = {fromId: user1.id, toId: 0, amount: 100};

    it('Anonymous - deny', () => {
      return api.post(`${COLLECTION_URL}/payment`)
        .expect(401)
    });

    it('User1 - deny', () => {
      return user1Promise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/payment`)
          .expect(401)
      });
    });

    it('Admin - deny', () => {
      return adminPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/payment`)
          .expect(401)
      });
    });

    it('Super - allow', () => {
      return superPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/payment`)
          .send(data)
          .expect(200)
      });
    })
  })
});
