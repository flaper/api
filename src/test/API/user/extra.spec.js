import {api, user1, user2,  superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import _ from 'lodash';
let should = require('chai').should();

describe(`/users/:id/extra`, function () {
  updateTimeouts(this);

  function _url(id) {
    return `users/${id}/extra`;
  }

  describe('GET', () => {
    it('Anonymous - deny', function*() {
      yield (api.get(_url(user1.id))
        .expect(401));
    });

    it('User - deny access to foreign', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.get(_url(user2.id))
        .expect(401));
    });

    it('User - allow access to yourself', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.get(_url(user1.id))
        .expect(200));
    });

    it('Super - allow access to any', function*() {
      let {agent} = yield (superPromise);
      yield (agent.get(_url(user1.id))
        .expect(200));
    });
  });
});
