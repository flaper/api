import {api, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
import _ from 'lodash';
let should = require('chai').should();
const USERS = require('../../fixtures/allUsers');

let User = app.models.User;
let UserSettings = app.models.UserSettings;

const USER1 = USERS.user1;


describe(`/user/:id/settings`, function () {
  updateTimeouts(this);
  function _url(id) {
    return `users/${id}/settings`;
  }

  describe('GET', () => {
    it('Anonymous - allow access to settings', () => {
      return api.get(_url(USER1.id))
        .expect(200)
    });
  });

  describe('POST', () => {
    it('User - deny to update another\'s settings', () => {
      return adminPromise.then(({agent}) => {
        return agent.post(_url(USER1.id) + '/' + UserSettings.NAMES.SHOW_SOCIAL_LINKS)
          .send({value: false})
          .expect(401)
      })
    });

    it('User - allow to update my settings', () => {
      return user1Promise.then(({agent}) => {
          return agent.post(_url(USER1.id) + '/' + UserSettings.NAMES.SHOW_SOCIAL_LINKS)
            .send({value: false})
            .expect(200)
            .expect((res) => {
              let value = res.body;
              should.exist(value);
              value.should.eq('false');
            })
        })
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.get(_url(USER1.id))
              .expect(200)
              .expect((res) => {
                let settings = res.body;
                should.exist(settings);
                let setting = settings[UserSettings.NAMES.SHOW_SOCIAL_LINKS];
                should.exist(setting);
                setting.should.eq('false');
              })
          })
        })
    });

    it('User - deny to update wrong settings', () => {
      return user1Promise.then(({agent}) => {
        return agent.post(_url(USER1.id) + '/wrong-settings')
          .send({value: false})
          .expect(400)
      })
    });
  });
});
