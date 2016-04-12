import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';

let FObject = app.models.FObject;
const COLLECTION_URL = 'objects';
const OBJECT1 = OBJECTS.obj1;
const OBJECT2 = OBJECTS.obj2;

describe(`/${COLLECTION_URL}/@get`, function () {
  updateTimeouts(this);

  describe('GET', () => {
    it('Anonymous - should return active objects by default with ordering "created DESC"', () => {
      return api.get(COLLECTION_URL)
        .query()
        .expect(200)
        .expect((res) => {
          let objects = res.body;
          objects.length.should.at.least(1);
          let created = new Date();
          objects.forEach(obj => {
            obj.status.should.eq(FObject.STATUS.ACTIVE);
            //check default ordering
            let date = new Date(obj.created);
            date.should.most(created);
            created = date;
          });
        })
    });
    //
    it('Anonymous - should return only deleted objects', () => {
      return api.get(COLLECTION_URL)
        .query({filter: {where: {status: FObject.STATUS.DELETED}}})
        .expect(200)
        .expect((res) => {
          let objects = res.body;
          objects.length.should.at.least(1);
          objects.forEach(obj => obj.status.should.eq(FObject.STATUS.DELETED));
        })
    });

    it('Anonymous - should return deleted and active objects', () => {
      return api.get(COLLECTION_URL)
        .query({filter: {where: {or: {0: {status: FObject.STATUS.ACTIVE}, 1: {status: FObject.STATUS.DELETED}}}}})
        .expect(200)
        .expect((res) => {
          let objects = res.body;
          objects.length.should.at.least(2);
          let activeFound = objects.find(obj => obj.status === FObject.STATUS.ACTIVE);
          let deniedFound = objects.find(obj => obj.status === FObject.STATUS.DELETED);
          should.exist(activeFound);
          should.exist(deniedFound);
          objects.forEach(obj => {
            [FObject.STATUS.DELETED, FObject.STATUS.ACTIVE].should.include(obj.status);
          });
        })
    });

    it('Anonymous - should return deleted and active objects', () => {
      return api.get(`${COLLECTION_URL}/${OBJECT2.id}`)
        .expect(200)
        .expect((res) => {
          let object = res.body;
          should.exist(object);
          should.not.exist(object.emails);
        })
    });
  });

  describe('COUNT', () => {
    it('Should return active, than deleted, than both, then check sum', () => {
      let activeCount = 0;
      let deletedCount = 0;
      let totalCount = 0;
      return user1Promise.then(({agent}) => {
          return agent.get(`${COLLECTION_URL}/count`)
            .expect(200)
            .expect((res) => {
              let data = res.body;
              activeCount = data.count;
              activeCount.should.be.least(1);
            })
        })
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.get(`${COLLECTION_URL}/count`)
              .query({where: {status: FObject.STATUS.DELETED}})
              .expect(200)
              .expect((res) => {
                let data = res.body;
                deletedCount = data.count;
                deletedCount.should.be.least(1);
              })
          })
        })
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.get(`${COLLECTION_URL}/count`)
              .query({where: {or: {0: {status: FObject.STATUS.ACTIVE}, 1: {status: FObject.STATUS.DELETED}}}})
              .expect(200)
              .expect((res) => {
                let data = res.body;
                totalCount = data.count;
                totalCount.should.be.eq(activeCount + deletedCount);
              })
          })
        })
    })
  })
});
