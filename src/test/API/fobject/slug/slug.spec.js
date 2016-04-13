import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';
const OBJECT1 = OBJECTS.obj1;
const PLACE1 = OBJECTS.place1;

let FObject = app.models.FObject;
const COLLECTION_URL = 'objects/bySlug';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  it('/slug/:slug should not exists', () => {
    return api.get('objects/slug/' + encodeURIComponent(OBJECT1.slugLowerCase))
      .expect(404)
  });

  it('Get film by slug', () => {
    return api.get(COLLECTION_URL)
      .send({mainDomain: OBJECT1.mainDomain, slug: OBJECT1.slugLowerCase})
      .expect(200)
      .expect((res) => {
        let obj = res.body;
        obj.id.should.eq(OBJECT1.id)
      });
  });

  it('Get place by slug', () => {
    return api.get(COLLECTION_URL)
      .send({mainDomain: PLACE1.mainDomain, region: PLACE1.region, slug: PLACE1.slugLowerCase})
      .expect(200)
      .expect((res) => {
        let obj = res.body;
        obj.id.should.eq(PLACE1.id)
      });
  });
});
