import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
let FObject = app.models.FObject;
const COLLECTION_URL = 'objects/flapSync';
import _ from 'lodash';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);
  const FLAP_IDS = {
    ID1: 23187,
    ID2: 3329255,
    ID3: 4484301
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
      })
  });

  it('Anonymous - sync two times', () => {
    const ID = FLAP_IDS.ID3;
    let objId = null;
    let title = null;
    return user1Promise.then(() => {
        return api.post(COLLECTION_URL)
          .send({id: ID})
          .expect(200)
          .expect(res => {
            let obj = res.body;
            should.exist(obj.id);
            should.exist(obj.title);
            objId = obj.id;
            title = obj.title;
          })
      })
      .then(() => FObject.findByIdRequired(objId))
      .then((obj) => {
        obj.title = 'NEW TITLE';
        return obj.save();
      })
      .then(() => user1Promise.then(() => {
        return api.post(COLLECTION_URL)
          .send({id: ID})
          .expect(200)
          .expect(res => {
            let obj = res.body;
            should.exist(obj.id);
            should.exist(obj.title);
            obj.id.should.eq(objId);
            obj.title.should.eq(title);
          })
      }))
  });

  after(() => {
    let ids = [];
    _.forOwn(FLAP_IDS, (id) => ids.push(id));
    return FObject.deleteAll({'flap.id': {inq: ids}})
  })
});
