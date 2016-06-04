import {api, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import _ from 'lodash';
let should = require('chai').should();
const USERS = require('../../fixtures/allUsers');

let User = app.models.User;
let UserExtra = app.models.UserExtra;

const USER1 = USERS.user1;
const USER2 = USERS.user2;


describe(`/users/:id/extra`, function () {
  updateTimeouts(this);

  function _url(id) {
    return `users/${id}/extra`;
  }

  describe('GET', () => {
    it('Anonymous - deny', () => {
      return api.get(_url(USER1.id))
        .expect(401)
    });

    it('User - deny access to foreign', () => {
      return user1Promise.then(({agent}) => {
        return agent.get(_url(USER2.id))
          .expect(401)
      })
    });

    it('User - allow access to yourself', () => {
      return user1Promise.then(({agent}) => {
        return agent.get(_url(USER1.id))
          .expect(200)
      })
    });
  });
});
