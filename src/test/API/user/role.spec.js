import {api, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import _ from 'lodash';
let should = require('chai').should();
const USERS = require('../../fixtures/allUsers');

let User = app.models.User;

const ADMIN = USERS.testAdmin;
const USER1 = USERS.user1;
const COLLECTION_URL = 'users';


describe(`/users/:id/roles`, function () {
  updateTimeouts(this);
  describe('GET', () => {
    it('Anonymous - allow access to the list', function*() {
      return api.get(`${COLLECTION_URL}/${ADMIN.id}/roles`)
        .expect(200)
        .expect((res) => {
          let roles = res.body;
          roles.length.should.eq(1);
          'admin'.should.eq(roles[0]);
        })
    });
  });

  describe('GET', () => {
    it('Anonymous - include roles for user', function*() {
      return api.get(`${COLLECTION_URL}/${ADMIN.id}`)
        .query({filter: {include: 'roles'}})
        .expect(200)
        .expect((res) => {
          let user = res.body;
          let roles = user.roles;
          should.exist(roles);
          roles.length.should.eq(1);
          'admin'.should.eq(roles[0]);
        })
    });
  });

  describe('POST', () => {
    it('User - deny to link new role for him', function*() {
      let {agent} = yield user1Promise;
        return agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
          .send({role: 'admin'})
          .expect(401)
    });

    it('Admin - deny to link new role for him', function*() {
      let {agent} = yield adminPromise;
      return agent.post(`${COLLECTION_URL}/${ADMIN.id}/roles`)
        .send({role: 'super'})
        .expect(401);
    });

    it('Duplicated roles should be ignored', function*() {
      let {agent} = yield superPromise;
      yield agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
        .send({role: 'super'})
        .expect(200);
      yield agent.get(`${COLLECTION_URL}/${USER1.id}/roles/count`)
        .expect(200)
        .expect(res => res.body.count.should.eq(1));
    });

    it('Super - allow to link new role', function*() {
      let {agent} = yield superPromise;
      yield agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
        .send({role: 'super'})
        .expect(200);
      yield agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
        .send({role: 'admin'})
        .expect(200);

    });

    it('Super - deny to link not existed role', function*() {
      let {agent} = yield superPromise;
      return agent.post(`${COLLECTION_URL}/${USER1.id}/roles`)
        .send({role: 'not_exists'})
        .expect(404);
    });

    it('Super - deny to link role for not existed user', function*() {
      let {agent} = yield superPromise;
      return agent.post(`${COLLECTION_URL}/b333/roles`)
        .send({role: 'admin'})
        .expect(404)
    });

  });

  describe('DELETE', () => {
    it('Admin - deny to delete', function*() {
      let {agent} = yield adminPromise;
      return agent.del(`${COLLECTION_URL}/${USER1.id}/roles`)
        .expect(401)
    });

    it('Super - allow to delete', function*() {
      let {agent} = yield superPromise;
      return agent.del(`${COLLECTION_URL}/${USER1.id}/roles`)
        .expect(204)
    });
  });
});
