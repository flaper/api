import {api, user1, user1Promise, user2Promise, user2, adminPromise, superPromise, superUser} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
let should = require('chai').should();
import app from '../../helpers/app';
import {returnProperties} from '../commonModel/helper'
import _ from 'lodash';
import MESSAGES from '../../fixtures/supportMessage.js';
const MESSAGE1 = MESSAGES.msg1;

const User = app.models.User;
const SupportMessage = app.models.SupportMessage;
const COLLECTION_URL = 'supportMessages';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('GET dialogs', () => {
    let url = `${COLLECTION_URL}/dialogs`;
    it('Anonymous - deny', () => {
      return api.get(url)
        .expect(401)
    });

    it('User - deny', function*() {
      let {agent} = yield user1Promise;
        return agent.get(url)
          .expect(401);
    });

    it('Super - allow', function*() {
      let {agent} = yield superPromise;
      return agent.get(url)
        .expect(200)
        .expect(res => {
          let dialogs = res.body;
          dialogs.length.should.least(2);
          let dialogsIds = dialogs.map(message => message.dialog);
          dialogsIds = _.uniq(dialogsIds);
          //so all dialogs are unique actually
          dialogsIds.length.should.eq(dialogs.length);
        })
    })
  });

  describe('GET dialog', () => {
    let url = `${COLLECTION_URL}/dialogs/${user1.id}`;
    it('Anonymous - deny', () => {
      return api.get(url)
        .expect(401)
    });

    it('Regular user - deny', function*() {
      let {premiumSupport} = yield User.getExtra(user2.id);
      yield User.updateExtraValue(user2.id, 'premiumSupport', null);
      let {agent} = yield user2Promise;
      yield agent.get(url)
        .expect(403);
      return User.updateExtraValue(user2.id, 'premiumSupport', premiumSupport);
    });

    it('User with premiumSupport - allow', function*() {
      let {agent} = yield user1Promise;
      return agent.get(url)
        .expect(res => {
          let messages = res.body;
          messages.length.should.least(2);
          messages.forEach(message => {
            true.should.eq(message.toId === user1.id || message.fromId === user1.id);
          })
        })
    });

    it('Super - allow', function*() {
      let {agent} = yield superPromise;
      return agent.get(url)
        .expect(res => {
          let messages = res.body;
          messages.length.should.least(2);
          messages.forEach(message => {
            true.should.eq(message.toId === user1.id || message.fromId === user1.id);
          })
        })
    })
  });

  describe('POST', () => {
    let toSupport = {toId: 0, message: 'I have issue with http://flaper.org/something'};
    let fromSupport = {toId: user1.id, message: 'Fixed'};
    it('Anonymous - deny', () => {
      return api.post(COLLECTION_URL)
        .send(toSupport)
        .expect(401)
    });

    it('Regular user - deny', function*() {
      let {premiumSupport} = yield User.getExtra(user2.id);
      yield User.updateExtraValue(user2.id, 'premiumSupport', null);
      let {agent} = yield user2Promise;
      yield agent.post(COLLECTION_URL)
        .send(toSupport)
        .expect(403);
      return User.updateExtraValue(user2.id, 'premiumSupport', premiumSupport);
    });

    it('User with premiumSupport access - allow', function*() {
      let {agent} = yield user1Promise;
      return agent.post(COLLECTION_URL)
        .send(toSupport)
        .expect(200)
        .expect(res => {
          let message = res.body;
          message.toId.should.eq('0');
          message.fromId.should.eq(user1.id);
          message.dialog.should.eq(user1.id);
          message.message.should.eq(toSupport.message);
        });
    });

    it('Admin can answer', function*() {
      let {agent} = yield superPromise;
      return agent.post(COLLECTION_URL)
        .send(fromSupport)
        .expect(200)
        .expect(res => {
          let message = res.body;
          message.toId.should.eq(user1.id);
          message.fromId.should.eq(superUser.id);
          message.dialog.should.eq(user1.id);
        });
    });
  });

  describe('DELETE', () => {
    let url = `${COLLECTION_URL}/${MESSAGE1.id}`;

    it('Anonymous - deny', () => {
      return api.del(url)
        .expect(401)
    });

    it('Another user - deny', function*() {
      let {agent} = yield user2Promise;
      return agent.del(url)
        .expect(403)
    });

    it('Allow for own message', function*() {
      let {agent} = yield user1Promise;
      yield agent.del(url)
        .expect(200);
      let message = yield SupportMessage.findByIdRequired(MESSAGE1.id)
      return message.status.should.eq('deleted');
    });

    after(() => returnProperties(SupportMessage, MESSAGE1.id, {status: 'active'}))
  })
});
