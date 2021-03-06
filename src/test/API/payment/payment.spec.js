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

  it.skip('User should be able to make payment', function*() {
    let {agent} = yield user1Promise;
    return agent.post(COLLECTION_URL)
      .expect(200)
  });

});
