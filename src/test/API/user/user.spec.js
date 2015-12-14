import {api, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';

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
        .expect(200);
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
  });

  describe('POST', () => {
    const NEW_USER = {
      'id': '1a1000000000000000010099',
      'username': 'newUser',
      'email': 'newUser@test.com',
      'password': 'newUser'
    };

    it('User - deny to add', () => {
      return user1Promise.then(({agent}) => {
        return agent.post(COLLECTION_URL)
          .send(NEW_USER)
          .expect(401)
      })
    });

    it('Admin - allow to add', () => {
      return adminPromise.then(({agent}) => {
        return agent.post(COLLECTION_URL)
          .send(NEW_USER)
          .expect(200)
      })
    });

    after(()=> User.deleteById(NEW_USER.id));
  });

  describe('PUT', () => {
    const NEW_PASSWORD = 'new password';
    it('User - allow to update his password/account', ()=> {
      return user1Promise.then(({agent}) => {
          return agent.put(`${COLLECTION_URL}/${USER1.id}`)
            .send({password: NEW_PASSWORD})
            .expect(200)
        })
        .then(()=> {
          return api.post(`${COLLECTION_URL}/login`)
            .send(USER1)
            .expect(401);
        })
        .then(()=> {
          return api.post(`${COLLECTION_URL}/login`)
            .send(_.assign({}, USER1, {password: NEW_PASSWORD}))
            .expect(200);
        })
    });

    it('Anonymous - deny to update account', () => {
      return api.put(`${COLLECTION_URL}/${USER1.id}`)
        .send({password: NEW_PASSWORD})
        .expect(401)
    });


    it('User - deny to update another\'s password/account', ()=> {
      return user1Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${USER2.id}`)
          .send({password: NEW_PASSWORD})
          .expect(401)
      })
    });

    it('User - deny to update anyone', () => {
      return user1Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${USER2.id}`)
          .send({fullName: 'test'})
          .expect(401)
      })
    });

    it('Admin - deny to update anyone', () => {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${USER1.id}`)
          .send({fullName: 'test'})
          .expect(401)
      })
    });

    it('Super - allow to update anyone', () => {
      return superPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${USER1.id}`)
          .send({password: NEW_PASSWORD})
          .expect(200)
      })
    });

    after(() => {
      return superPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${USER1.id}`)
          .send({password: USER1.password})
          .expect(200)
      })
    });
  });

  describe('DELETE', () => {
    it('Route should not exist', () => {
      return api.del(`${COLLECTION_URL}/${USER1.id}`)
        .expect(404)
    });
  })
});
