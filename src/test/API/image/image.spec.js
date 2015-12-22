import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();

const COLLECTION_URL = 'images';

describe(`/${COLLECTION_URL}/create`, function () {
  updateTimeouts(this);

  it('Anonymous should be denied', () => {
    return api.post(COLLECTION_URL)
      .expect(401);
  });
});
