import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
let FObject = app.models.FObject;
const COLLECTION_URL = 'objects/flapSync';
import _ from 'lodash';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);
  const FLAP_IDS = {
    ID1: 23187,
    ID2: 3329255,
    ID3: 4484301,
    ID_CLOSED: 21920
  };

  it('Anonymous - sync company', () => {
    const ID = FLAP_IDS.ID1;//национальная деревня
    return api.post(COLLECTION_URL)
      .send({id: ID})
      .expect(200)
      .expect(res => {
        let obj = res.body;
        obj.title.should.eq('Армянский Дом');
        obj.mainDomain.should.eq(FObject.DOMAINS.PLACES);
        obj.region.should.eq('оренбург');
        obj.flap.id.should.eq(ID);
        obj.flap.reviewsNumber.should.least(40);
        should.exist(obj.fields);
        let fields = obj.fields;
        should.exist(fields.address);
        should.exist(fields.location);
        (new Date(obj.created).getTime() / 1000).should.eq(1297321328);
        should.exist(obj.flap.avatar);
        obj.flap.images.length.should.least(10);
      })
  });

  it('Anonymous - sync film', () => {
    const ID = FLAP_IDS.ID2;//Фильм Время
    return api.post(COLLECTION_URL)
      .send({id: ID})
      .expect(200)
      .expect(res => {
        let obj = res.body;
        obj.title.should.eq('Время');
        obj.mainDomain.should.eq('кино');
        should.not.exist(obj.region);
        obj.flap.id.should.eq(ID);
        obj.flap.reviewsNumber.should.least(130);
        should.exist(obj.fields);
        let fields = obj.fields;
        if (fields) {
          should.not.exist(fields.address);
          should.not.exist(fields.location);
        }
        obj.flap.creatorId.should.eq(3058272);
      })
  });

  it('Anonymous - sync two times', function*() {
    const ID = FLAP_IDS.ID3;
    let objId = null;
    let title = null;
    yield (api.post(COLLECTION_URL)
      .send({id: ID})
      .expect(200)
      .expect(res => {
        let obj = res.body;
        should.exist(obj.id);
        should.exist(obj.title);
        objId = obj.id;
        title = obj.title;
      }));

    let obj = yield  (FObject.findByIdRequired(objId));
    obj.title = 'NEW TITLE';
    yield (obj.save());
    yield (api.post(COLLECTION_URL)
      .send({id: ID})
      .expect(200)
      .expect(res => {
        let obj = res.body;
        should.exist(obj.id);
        should.exist(obj.title);
        obj.id.should.eq(objId);
        obj.title.should.eq(title);
      }));
  });

  it('Wrong ID', () => {
    return api.post(COLLECTION_URL)
      .send({id: 1})
      .expect(400)
  });

  it('Closed ID', () => {
    return api.post(COLLECTION_URL)
      .send({id: FLAP_IDS.ID_CLOSED})
      .expect(400)
  });

  after(() => {
    let ids = [];
    _.forOwn(FLAP_IDS, (id) => ids.push(id));
    return FObject.deleteAll({'flap.id': {inq: ids}})
  })
});
