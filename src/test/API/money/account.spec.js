import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
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

});
