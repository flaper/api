import {api, user1, user2, admin, salesPromise, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import _ from 'lodash';
let should = require('chai').should();
import OBJECTS from  '../../fixtures/fObject.js';

const {User, UserExtra} = app.models;

describe(`/users/:id/objects`, function () {
  updateTimeouts(this);

  function _url(id) {
    return `users/${id}/objects`;
  }

  function _getUrl(id) {
    return `users/${id}/objectsIds`;
  }

  let idsBefore1, idsBefore2;

  before(function*() {
    idsBefore1 = yield (UserExtra.getObjectsIds(user1.id));
    idsBefore2 = yield (UserExtra.getObjectsIds(user2.id));
    yield (UserExtra.updateValue(user1.id, 'objects', []));
    yield (UserExtra.updateValue(user2.id, 'objects', []));
  });

  describe('GET', () => {
    it('User - deny foreign access', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.get(_getUrl(user2.id))
        .expect(401));
    });

    it('User - allow access to his list', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.get(_getUrl(user1.id))
        .expect(200));
    });

    it('Sales - allow access to anyone list', function* () {
      let {agent} = yield (salesPromise);
      yield (agent.get(_getUrl(user1.id))
        .expect(200));
    });

    it('Super - allow access to anyone list', function* () {
      let {agent} = yield (superPromise);
      yield (agent.get(_getUrl(user1.id))
        .expect(200));
    });
  });

  describe('PUT', () => {
    it('Anonymous - deny', function* () {
      yield (api.put(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(401));
    });

    it('User - deny to link himself', function* () {
      let {agent} = yield (user1Promise);
      yield (agent.put(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(403));
    });

    it('Admin - deny to link himself', function* () {
      let {agent} = yield (adminPromise);
      yield (agent.put(_url(admin.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(403));
    });

    it('Super - allow to link anyone, then object owner will be able to add another user', function* () {
      let {agent} = yield (superPromise);
      yield (agent.put(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(200));
      agent = (yield (user1Promise)).agent;
      yield (agent.put(_url(user2.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(200));
      agent = (yield (superPromise)).agent;
      yield (agent.get(_getUrl(user2.id))
        .expect(200)
        .expect(res => {
          let objects = res.body;
          objects.should.include(OBJECTS.obj1.id);
        }));
    });
  });

  describe('DELETE', () => {
    it('Anonymous - deny', function* () {
      yield (api.del(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(401));
    });

    it('Super - allow to unlink anyone', function*() {
      let {agent} = yield (superPromise);
      return (agent.del(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(200)
        .expect(res => {
          let objects = res.body;
          let obj1 = objects.find(id => OBJECTS.obj1.id);
          should.not.exist(obj1);
        }));
    });

    it('User - deny to unlink if not owner', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.del(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(403));
    });

    it('User - allow to unlink if owner', function*() {
      let {agent} = yield (superPromise);
      yield (agent.put(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(200));
      agent = (yield (user1Promise)).agent;
      yield (agent.del(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(200));
    });

    after(function*() {
      yield (UserExtra.updateValue(user1.id, 'objects', idsBefore1));
      yield (UserExtra.updateValue(user2.id, 'objects', idsBefore2));
    })
  });
});
