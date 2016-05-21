import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
let should = require('chai').should();

const COLLECTION_URL = 'payments';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);


  it('GET should not exists', () => {
    return api.get(COLLECTION_URL)
      .expect(404)
  });

  it('Anonymous should not be able to make payment', () => {
    return api.post(COLLECTION_URL)
      .expect(401)
  });

  it('User should be able to make payment', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .expect(200)
    });
  });

});
