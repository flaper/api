import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';
import {OBJECT_PERMISSIONS} from '@flaper/consts';

let {FObject, UserExtra} = app.models;
const COLLECTION_URL = 'objects';
const OBJECT1 = OBJECTS.obj1;

describe(`/${COLLECTION_URL}/@permissions`, function () {
  updateTimeouts(this);

  it('Anonymous - should have empty permissions', function*() {
    yield (api.get(`${COLLECTION_URL}/${OBJECT1.id}/permissions`)
      .query()
      .expect(200)
      .expect(res => {
        let permissions = res.body;
        permissions.length.should.eq(0);
      }));
  });

  describe("User", ()=> {
    let idsBefore1;
    before(function*() {
      idsBefore1 = yield (UserExtra.getObjectsIds(user1.id));
      yield (UserExtra.updateValue(user1.id, 'objects', []));
    });

    it('User - should have some permissions', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.get(`${COLLECTION_URL}/${OBJECT1.id}/permissions`)
        .query()
        .expect(200)
        .expect(res=> {
          let permissions = res.body;
          permissions.length.should.eq(1);
          permissions.should.contain(OBJECT_PERMISSIONS.INFO_CHANGE);
        }));
    });

    after(function*() {
      yield (UserExtra.updateValue(user1.id, 'objects', idsBefore1));
    });
  });

  describe("Owner should have different permissions", ()=> {
    let idsBefore1;
    before(function*() {
      idsBefore1 = yield (UserExtra.getObjectsIds(user1.id));
      yield (UserExtra.updateValue(user1.id, 'objects', [OBJECT1.id]));
    });

    it('User - should have some permissions', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.get(`${COLLECTION_URL}/${OBJECT1.id}/permissions`)
        .query()
        .expect(200)
        .expect(res=> {
          let permissions = res.body;
          permissions.length.should.least(8);
          permissions.should.contain(OBJECT_PERMISSIONS.OWNERS_ADD);
          permissions.should.contain(OBJECT_PERMISSIONS.ANSWER);
        }));
    });

    after(function*() {
      yield (UserExtra.updateValue(user1.id, 'objects', idsBefore1));
    });
  });
});
