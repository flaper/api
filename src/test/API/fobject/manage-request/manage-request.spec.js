import {api, user1, user1Promise, user2, user2Promise, adminPromise, admin, superPromise, superUser}
  from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';

let FObject = app.models.FObject;
let ManageRequest = app.models.ManageRequest;
const COLLECTION_URL = 'ManageRequests';
const OBJECT1 = OBJECTS.obj1;
const PLACE1 = OBJECTS.place1;

describe.only(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);
  const requestsIds = [];

  describe('CREATE', () => {
    const NEW_REQUEST = {
      name: 'Josef Bush',
      position: 'Owner',
      phone: '1234567890',
      email: 'email@gmail.com',
      subjectId: OBJECT1.id
    };

    it('Anonymous - deny to create manage request', () => {
      api.post(COLLECTION_URL)
        .send(NEW_REQUEST)
        .expect(401)
    });

    it('User1 - should be able to create manage request', () => {
      return user1Promise.then(({agent})=> {
        return agent.post(COLLECTION_URL)
          .send(NEW_REQUEST)
          .expect(200)
          .expect((res) => {
            let request = res.body;
            requestsIds.push(request.id);
            request.status.should.eq(ManageRequest.STATUS.ACTIVE);
            request.name.should.eq(NEW_REQUEST.name);
            request.position.should.eq(NEW_REQUEST.position);
            request.phone.should.eq(NEW_REQUEST.phone);
            request.email.should.eq(NEW_REQUEST.email);
            request.subjectId.should.eq(OBJECT1.id);
          })
      });
    });

    it('User1 should be able to get his request', () => {
      return user1Promise.then(({agent})=> {
        return agent.get(COLLECTION_URL)
          .expect(200)
          .expect((res) => {
            let requests = res.body;
            let req = requests.find(req => req.userId === user1.id);
            let approved = requests.find(req => req.status === ManageRequest.STATUS.APPROVED);
            should.exist(req);
            should.not.exist(approved);
          })
      });
    });

    it('User1 should be able to get his approved request', () => {
      return user1Promise.then(({agent})=> {
        return agent.get(COLLECTION_URL)
          .send({filter: {where: {status: ManageRequest.STATUS.APPROVED}}})
          .expect(200)
          .expect((res) => {
            let requests = res.body;
            let approved = requests.find(req => req.status === ManageRequest.STATUS.APPROVED);
            let not_approved = requests.find(req => req.status !== ManageRequest.STATUS.APPROVED);
            should.exist(approved);
            should.not.exist(not_approved);
          })
      });
    });

    it('User2 should not be able to get another\'s request', () => {
      return user2Promise.then(({agent})=> {
        return agent.get(COLLECTION_URL)
          .expect(200)
          .expect((res) => {
            let requests = res.body;
            let req = requests.find(req => req.userId !== user2.id);
            should.not.exist(req);
          })
      });
    });

    it('Admin should not be able to get another\'s request', () => {
      return adminPromise.then(({agent})=> {
        return agent.get(COLLECTION_URL)
          .expect(200)
          .expect((res) => {
            let requests = res.body;
            let req = requests.find(req => req.userId !== admin.id);
            should.not.exist(req);
          })
      });
    });

    it('Super should be able to get another\'s request', () => {
      return superPromise.then(({agent})=> {
        return agent.get(COLLECTION_URL)
          .expect(200)
          .expect((res) => {
            let requests = res.body;
            let req = requests.find(req => req.userId !== superUser.id);
            should.exist(req);
          })
      });
    });
  });


  after(() => FObject.deleteAll({'id': {inq: requestsIds}}))
});
