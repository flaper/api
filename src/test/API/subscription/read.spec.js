import {api, user1, user2, user3} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
let Subscription = app.models.Subscription;

const COLLECTION_URL = 'subscriptions';

describe(`/${COLLECTION_URL}/read`, function () {
  updateTimeouts(this);
  
  const NEW_SUBSCRIPTION_1 = {
    userId: user1.id,
    targetId: user2.id,
  };
  const NEW_SUBSCRIPTION_2 = {
    userId: user2.id,
    targetId: user1.id,
  };
  const NEW_SUBSCRIPTION_3 = {
    userId: user1.id,
    targetId: user3.id,
  };
  const NEW_SUBSCRIPTION_4 = {
    userId: user3.id,
    targetId: user2.id,
  };

  before(() => {
    Subscription.create(NEW_SUBSCRIPTION_1);
    Subscription.create(NEW_SUBSCRIPTION_2);
    Subscription.create(NEW_SUBSCRIPTION_3);
    Subscription.create(NEW_SUBSCRIPTION_4);
  });

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
