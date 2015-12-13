import {api, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';

const USERS = require('../../fixtures/users');
import _ from 'lodash';
let should = require('chai').should();

let User = app.models.User;

const ADMIN = USERS.testAdmin;
const USER1 = USERS.user1;
const COLLECTION_URL = 'users';


describe(`/users/:id/roles`, function () {
  updateTimeouts(this);
  describe('GET', () => {
    it('Admin - allow access to the list', () => {
      return adminPromise.then(({agent}) => {
        return agent.get(`${COLLECTION_URL}/${USER1.id}/roles`)
          .expect(200)
      })
    });
  });

  describe('POST', () => {
    it('User - deny to link new role for him', () => {
      return user1Promise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
          .send({role: 'admin'})
          .expect(401)
      })
    });

    it('Admin - deny to link new role for him', () => {
      return adminPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${ADMIN.id}/roles`)
          .send({role: 'super'})
          .expect(401)
      })
    });

    it('Duplicated roles should be ignored', () => {
      return superPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
          .send({role: 'super'})
          .expect(200)
      })
        .then(() => {
          return superPromise.then(({agent}) => {
            return agent.get(`${COLLECTION_URL}/${USER1.id}/roles/count`)
              .expect(200)
              .expect(res => res.body.count.should.eq(1));
          });
        })
    });

    it('Super - allow to link new role', () => {
      return superPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
          .send({role: 'super'})
          .expect(200)
      })
        .then(() => {
          //Former regular user now can update his role
          return user1Promise.then(({agent}) => {
            return agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
              .send({role: 'admin'})
              .expect(200)
          })
        })
    });

    it('Super - deny to link not existed role', () => {
      return superPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
          .send({role: 'not_exists'})
          .expect(404)
      })
    });

    it('Super - deny to link role for not existed user', () => {
      return superPromise.then(({agent}) => {
        return agent.post(`${COLLECTION_URL}/b333/roles`)
          .send({role: 'admin'})
          .expect(404)
      })
    });

  });

  describe('DELETE', () => {
    it('Admin - deny to delete', () => {
      return adminPromise.then(({agent}) => {
        return agent.del(`${COLLECTION_URL}/${USER1.id}/roles`)
          .expect(401)
      })
    });

    it('Super - allow to delete', () => {
      return superPromise.then(({agent}) => {
        return agent.del(`${COLLECTION_URL}/${USER1.id}/roles`)
          .expect(204)
      })
    });
  });
});
