import {api, superPromise, adminPromise, user1Promise, superUser} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';

const USERS = require('../../fixtures/allUsers');
import _ from 'lodash';
let should = require('chai').should();

let User = app.models.User;

const STAS = USERS.stas;
const USER1 = USERS.user1;
const USER2 = USERS.user2;
const COLLECTION_URL = 'users';


describe(`/${COLLECTION_URL}/`, function () {
  updateTimeouts(this);
  describe('GET/HEAD', () => {
    it('Anonymous - allow access to the list', () => {
      return api.get(COLLECTION_URL)
        .expect(200)
        .expect((res) => {
          let users = res.body;
          users.length.should.least(3);
          let user = users[0];
          should.not.exist(user.email);
        })
    });

    it('Anonymous - allow access to anyone by id', () => {
      return api.get(`${COLLECTION_URL}/${STAS.id}`)
        .expect(200)
        .expect((res) => {
          let user = res.body;
          should.not.exist(user.email);
        })
    });

    it('Anonymous - allow check if exists by id', () => {
      return api.get(`${COLLECTION_URL}/${STAS.id}/exists`)
        .expect(200);
    });

    it('Anonymous - allow HEAD', () => {
      return api.head(`${COLLECTION_URL}/${STAS.id}`)
        .expect(200);
    });

    it('Anonymous - allow count', () => {
      return api.get(`${COLLECTION_URL}/count`)
        .expect(200);
    });

    it('Anonymous - deny findOne', () => {
      return api.get(`${COLLECTION_URL}/findOne`)
        .expect(404);
    });
  });

  describe('login', () => {
    it('successful attempt should retrieve jwt (access) token', () => {
      return api.post(`${COLLECTION_URL}/login`)
        .send(STAS)
        .expect(200);
    });

    it('wrong password should fail', () => {
      return api.post(`${COLLECTION_URL}/login`)
        .send(_.assign({}, STAS, {password: 'wrong'}))
        .expect(401);
    });

    it('Super can login as well', () => {
      return api.post(`${COLLECTION_URL}/login`)
        .send(superUser)
        .expect(200);
    });
  });

  describe('POST', () => {
    const NEW_USER = {
      'id': '1a1000000000000000010099',
      'username': 'newUser',
      'email': 'newUser@test.com',
      'password': 'newUser'
    };

    it('User - deny to add', function*() {
      let {agent} = yield user1Promise;
        return agent.post(COLLECTION_URL)
          .send(NEW_USER)
          .expect(401)
    });

    it('Admin - allow to add', function*() {
      let {agent} = yield superPromise;
        return agent.post(COLLECTION_URL)
          .send(NEW_USER)
          .expect(200)
    });

    after(()=> User.deleteById(NEW_USER.id));
  });

  describe('PUT', () => {
    const NEW_PASSWORD = 'new password';
    it('User - allow to update his password/account', function*() {
      let {agent} =  yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${USER1.id}`)
        .send({password: NEW_PASSWORD})
        .expect(200));
      yield (api.post(`${COLLECTION_URL}/login`)
        .send(USER1)
        .expect(401));
      yield (api.post(`${COLLECTION_URL}/login`)
        .send(_.assign({}, USER1, {password: NEW_PASSWORD}))
        .expect(200));
      let user = yield (User.findById(USER1.id));
      yield (user.updateAttributes({password: USER1.password}));
    });

    it('Anonymous - deny to update account', function*() {
      yield (api.put(`${COLLECTION_URL}/${USER1.id}`)
        .send({password: NEW_PASSWORD})
        .expect(401));
    });


    it('User - deny to update another\'s password/account', function*() {
      let {agent} =  yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${USER2.id}`)
        .send({password: NEW_PASSWORD})
        .expect(401));
    });

    it('User - deny to update anyone', function*() {
      let {agent} =  yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${USER2.id}`)
        .send({fullName: 'test'})
        .expect(401));
    });

    it('Admin - deny to update anyone', function*() {
      let {agent} =  yield (adminPromise);
      yield (agent.put(`${COLLECTION_URL}/${USER1.id}`)
        .send({fullName: 'test'})
        .expect(401));
    });

    it('Super - allow to update anyone', function*() {
      let {agent} =  yield (superPromise);
      yield (agent.put(`${COLLECTION_URL}/${USER1.id}`)
        .send({password: NEW_PASSWORD})
        .expect(200));
      let user = yield (User.findById(USER1.id));
      yield (user.updateAttributes({password: USER1.password}));
    });
  });

  describe('DELETE', () => {
    it('Route should not exist', () => {
      return api.del(`${COLLECTION_URL}/${USER1.id}`)
        .expect(404)
    });
  });
});
