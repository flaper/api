import {api} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
let Subscription = app.models.Subscription;

const COLLECTION_URL = 'subscriptions';

describe.skip(`/${COLLECTION_URL}/read`, function () {
  updateTimeouts(this);

  it('Anonymous - allow access to the list', () => {
    return api.get(COLLECTION_URL)
      .expect(200)
      .expect((res) => {
        let subs = res.body;
        subs.length.should.least(4);
      })
  });
  it('Anonymous - allow count', () => {
    return api.get(`${COLLECTION_URL}/count`)
      .expect(200)
      .expect((res) => {
        let data = res.body;
        data.count.should.least(4);
      })
  });
});
