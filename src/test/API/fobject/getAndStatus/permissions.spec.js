import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';

let FObject = app.models.FObject;
const COLLECTION_URL = 'objects';
const OBJECT1 = OBJECTS.obj1;
const PLACE1 = OBJECTS.place1;

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

  it('User - should have empty permissions', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.get(`${COLLECTION_URL}/${OBJECT1.id}/permissions`)
      .query()
      .expect(200)
      .expect(res=>{
	let permissions = res.body;
	permissions.length.should.eq(1);
      }));
  });
});
