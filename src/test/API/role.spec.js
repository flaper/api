import {api} from '../helpers/api';
import {updateTimeouts} from './timeout';
let should = require('chai').should();
const COLLECTION_URL = 'roles';

describe(`/${COLLECTION_URL}/`, function () {
  updateTimeouts(this);
  it('List of roles should be public', () => {
    return api.get(COLLECTION_URL)
      .expect(200);
  });
});
