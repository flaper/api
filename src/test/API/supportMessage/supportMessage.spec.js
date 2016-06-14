import {api, user1, user1Promise, user2Promise, user2, adminPromise, superPromise, superUser} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
let should = require('chai').should();
import app from '../../helpers/app';
import _ from 'lodash';

let User = app.models.User;
const COLLECTION_URL = 'supportMessages';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('GET dialogs', () => {
    let url = COLLECTION_URL;
    it('Anonymous - deny', () => {
      return api.get(url)
        .expect(401)
    });

    it('User - deny', () => {
      return user1Promise.then(({agent}) => {
        return agent.get(url)
          .expect(401);
      });
    });

    it('Super - allow', () => {
      return superPromise.then(({agent}) => {
        return agent.get(url)
          .expect(res => {
            let dialogs = res.body;
            dialogs.length.should.least(2);
            let dialogsIds = dialogs.map(message => message.dialog);
            dialogsIds = _.uniq(dialogsIds);
            //so all dialogs are unique actually
            dialogsIds.length.should.eq(dialogs.length);
          })
      });
    })
  });

  describe('GET dialog', () => {
    let url = `${COLLECTION_URL}/${user1.id}`;
    it('Anonymous - deny', () => {
      return api.get(url)
        .expect(401)
    });

    it('Regular user - deny', () => {
      let premiumSupport = null;
      return User.getExtra(user2.id)
        .then(extra => premiumSupport => extra.premiumSupport)
        .then(() => User.updateExtraValue(user2.id, 'premiumSupport', null))
        .then(() => {
          return user2Promise.then(({agent}) => {
            return agent.get(url)
              .expect(403);
          });
        })
        .then(() => User.updateExtraValue(user2.id, 'premiumSupport', premiumSupport))
    });

    it('User with premiumSupport - allow', () => {
      return user1Promise.then(({agent}) => {
        return agent.get(url)
          .expect(res => {
            let messages = res.body;
            messages.length.should.least(2);
            messages.forEach(message => {
              true.should.eq(message.toId === user1.id || message.fromId === user1.id);
            })
          })
      });
    });

    it('Super - allow', () => {
      return superPromise.then(({agent}) => {
        return agent.get(url)
          .expect(res => {
            let messages = res.body;
            messages.length.should.least(2);
            messages.forEach(message => {
              true.should.eq(message.toId === user1.id || message.fromId === user1.id);
            })
          })
      });
    })
  });

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
            message.message.should.eq(toSupport.message);
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
