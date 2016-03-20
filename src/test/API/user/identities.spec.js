import {api, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
import _ from 'lodash';
let should = require('chai').should();
const USERS = require('../../fixtures/allUsers');

let User = app.models.User;

const USER1 = USERS.user1;


describe(`/user/:id/identities`, function () {
  updateTimeouts(this);
  function _url(id) {
    return `users/${id}/identities`;
  }

  describe('GET', () => {
    it('Anonymous - allow access to settings', () => {
      return api.get(_url(USER1.id))
        .expect(200)
        .expect((res) => {
          let identities = res.body;
          identities.length.should.least(2);
          identities.forEach(identity => {
            should.exist(identity.url);
            should.not.exist(identity.authScheme);
            should.not.exist(identity.credentials);
          });
        })
    });
  });
});
