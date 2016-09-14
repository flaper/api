import {api, user1Promise, user1, user2Promise,user2} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();

let Subscription = app.models.Subscription;
import STORIES from  '../../fixtures/story';

const COLLECTION_URL = 'subscriptions';

describe(`/${COLLECTION_URL}/delete`, function () {
  updateTimeouts(this);
  it('Anonymous - do not allow delete by id', () => {
    return api.del(`${COLLECTION_URL}/${user2.id}`)
      .expect(401)
  });

  it('User - deny delete if subscription not exist', () => {
    return user1Promise.then(({agent}) => {
      return agent.del(`${COLLECTION_URL}/${user1.id}`)
        .expect(404)
    })
  });

  describe("Sample subscription created", () => {
    const NEW_SUBSCRIPTION = {
      userId: user1.id,
      targetId: user2.id,
    };
    before(() => Subscription.create(NEW_SUBSCRIPTION));

    it("User - deny delete foreign subscription", () => {
      return user2Promise.then(({agent}) => {
        return agent.del(`${COLLECTION_URL}/${user2.id}`)
          .expect(404)
      })
    });
    it("User - allow delete", () => {
      return user1Promise.then(({agent}) => {
          return agent.del(`${COLLECTION_URL}/${user2.id}`)
            .expect(200)
        })
    })
  })
});
