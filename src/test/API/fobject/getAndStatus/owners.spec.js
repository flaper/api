import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';

let {UserExtra} = app.models;
const COLLECTION_URL = 'objects';
const OBJECT1 = OBJECTS.obj1;
const PLACE1 = OBJECTS.place1;

describe(`/${COLLECTION_URL}/@owners`, function () {
  updateTimeouts(this);
  let idsBefore1, idsBefore2;
  before(function*() {
    idsBefore1 = yield (UserExtra.getObjectsIds(user1.id));
    idsBefore2 = yield (UserExtra.getObjectsIds(user2.id));
    yield (UserExtra.updateValue(user1.id, 'objects', [OBJECT1.id, PLACE1.id]));
    yield (UserExtra.updateValue(user2.id, 'objects', [OBJECT1.id, PLACE1.id]));
  });

  it('Anonymous - should have empty permissions', function*() {
    yield (api.get(`${COLLECTION_URL}/${OBJECT1.id}/owners`)
      .query()
      .expect(200)
      .expect(res => {
        let owners = res.body;
        owners.length.should.least(2);
        owners.should.contain(user1.id);
        owners.should.contain(user2.id);
      }));
  });

  after(function*() {
    yield (UserExtra.updateValue(user1.id, 'objects', idsBefore1));
    yield (UserExtra.updateValue(user2.id, 'objects', idsBefore2));
  });
});
