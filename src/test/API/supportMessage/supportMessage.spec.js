import {api, user1, user1Promise, user2Promise, user2, adminPromise, superPromise, superUser} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
let should = require('chai').should();
import app from '../../helpers/app';

let User = app.models.User;
const COLLECTION_URL = 'supportMessages';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('POST', () => {
    let toSupport = {toId: 0, message: 'I have issue'};
    let fromSupport = {toId: user1.id, message: 'Fixed'};
    it('Anonymous - deny', () => {
      return api.post(COLLECTION_URL)
        .send(toSupport)
        .expect(401)
    });

    it('Regular user - deny', () => {
      let premiumSupport = null;
      return User.getExtra(user2.id)
        .then(extra => premiumSupport => extra.premiumSupport)
        .then(() => User.updateExtraValue(user2.id, 'premiumSupport', null))
        .then(() => {
          return user2Promise.then(({agent}) => {
            return agent.post(COLLECTION_URL)
              .send(toSupport)
              .expect(403);
          });
        })
        .then(() => User.updateExtraValue(user2.id, 'premiumSupport', premiumSupport))
    });

    it('User with premiumSupport access - allow', () => {
      return user1Promise.then(({agent}) => {
        return agent.post(COLLECTION_URL)
          .send(toSupport)
          .expect(200)
          .expect(res => {
            let message = res.body;
            message.toId.should.eq('0');
            message.fromId.should.eq(user1.id);
            message.dialog.should.eq(user1.id);
          })
      });
    });

    it('Admin can answer', () => {
      return superPromise.then(({agent}) => {
        return agent.post(COLLECTION_URL)
          .send(fromSupport)
          .expect(200)
          .expect(res => {
            let message = res.body;
            message.toId.should.eq(user1.id);
            message.fromId.should.eq(superUser.id);
            message.dialog.should.eq(user1.id);
          })
      });
    });
  })
});
