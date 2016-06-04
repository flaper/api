import {api, user1, user1Promise, user2, user2Promise, adminPromise, admin, superPromise, superUser}
  from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';
import _ from 'lodash';

let ManageRequest = app.models.ManageRequest;
const COLLECTION_URL = 'ManageRequests';
const OBJECT1 = OBJECTS.obj1;
const OBJECT_WITHOUT_MR = OBJECTS.obj_without_manage_requests;

describe(`/${COLLECTION_URL}/@general`, function () {
  updateTimeouts(this);
  const requestsIds = [];

  const NEW_REQUEST = {
    name: 'Josef Bush',
    position: 'Owner',
    phone: '1234567890',
    email: 'email@gmail.com',
    subjectId: OBJECT_WITHOUT_MR.id
  };

  it('Anonymous - deny to list manage requests', () => {
    return api.get(COLLECTION_URL)
      .send(NEW_REQUEST)
      .expect(401)
  });

  it('Anonymous - deny to create manage request', () => {
    return api.post(COLLECTION_URL)
      .send(NEW_REQUEST)
      .expect(401)
  });


  it('User1 - subjectId is required', () => {
    return user1Promise.then(({agent})=> {
      return agent.post(COLLECTION_URL)
        .send(_.omit(NEW_REQUEST, 'subjectId'))
        .expect(400)
    });
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
            request.subjectId.should.eq(OBJECT_WITHOUT_MR.id);
          })
      })
      .then(() => {
        //should not be able to create request for the same object twice
        return user1Promise.then(({agent})=> {
          return agent.post(COLLECTION_URL)
            .send(NEW_REQUEST)
            .expect(400)
        });
      })
  });

  it('User1 should be able to get his request', () => {
    return user1Promise.then(({agent})=> {
      return agent.get(COLLECTION_URL)
        .expect(200)
        .expect((res) => {
          let requests = res.body;
          let req = requests.find(req => req.userId === user1.id);
          let otherStatus = requests.find(req => req.status !== ManageRequest.STATUS.ACTIVE);
          should.exist(req);
          should.not.exist(otherStatus);
        })
    });
  });

  it('User1 should be able to get his request by subjectId', () => {
    return user1Promise.then(({agent})=> {
      return agent.get(COLLECTION_URL)
        .query({filter: {where: {subjectId: OBJECT1.id}}})
        .expect(200)
        .expect((res) => {
          let requests = res.body;
          let req = requests.find(req => req.userId === user1.id);
          let otherStatus = requests.find(req => req.status !== ManageRequest.STATUS.ACTIVE);
          should.exist(req);
          should.not.exist(otherStatus);
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


  after(() => ManageRequest.deleteAll({'id': {inq: requestsIds}}))
});
