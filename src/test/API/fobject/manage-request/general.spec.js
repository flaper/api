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

  it('Anonymous - deny to list manage requests', function*() {
    yield (api.get(COLLECTION_URL)
      .send(NEW_REQUEST)
      .expect(401));
  });

  it('Anonymous - deny to count', function* () {
    yield (api.get(`${COLLECTION_URL}/count`)
      .expect(401));
  });

  it('Anonymous - deny to create manage request', function* () {
    yield (api.post(COLLECTION_URL)
      .send(NEW_REQUEST)
      .expect(401));
  });

  it('User1 - subjectId is required', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(_.omit(NEW_REQUEST, 'subjectId'))
      .expect(400));
  });

  it('User1 - should be able to create manage request', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
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
      }));
    // should not be able to create request for the same object twice
    agent = (yield (user1Promise)).agent;
    yield (agent.post(COLLECTION_URL)
      .send(NEW_REQUEST)
      .expect(400));
  });

  it('User1 should be able to get his request', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.get(COLLECTION_URL)
      .expect(200)
      .expect((res) => {
        let requests = res.body;
        let req = requests.find(req => req.userId === user1.id);
        let otherStatus = requests.find(req => req.status !== ManageRequest.STATUS.ACTIVE);
        should.exist(req);
        should.not.exist(otherStatus);
      }))
  });

  it('User1 should be able to get his request by subjectId', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.get(COLLECTION_URL)
      .query({filter: {where: {subjectId: OBJECT1.id}}})
      .expect(200)
      .expect((res) => {
        let requests = res.body;
        let req = requests.find(req => req.userId === user1.id);
        let otherStatus = requests.find(req => req.status !== ManageRequest.STATUS.ACTIVE);
        should.exist(req);
        should.not.exist(otherStatus);
      }));
  });

  it('User1 should be able to get his approved request', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.get(COLLECTION_URL)
      .send({filter: {where: {status: ManageRequest.STATUS.APPROVED}}})
      .expect(200)
      .expect((res) => {
        let requests = res.body;
        let approved = requests.find(req => req.status === ManageRequest.STATUS.APPROVED);
        let not_approved = requests.find(req => req.status !== ManageRequest.STATUS.APPROVED);
        should.exist(approved);
        should.not.exist(not_approved);
      }));
  });

  it('User1 should not be able to count', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.get(`${COLLECTION_URL}/count`)
      .expect(401));
  });

  it('User2 should not be able to get another\'s request', function*() {
    let {agent} = yield (user2Promise);
    yield (agent.get(COLLECTION_URL)
      .expect(200)
      .expect((res) => {
        let requests = res.body;
        let req = requests.find(req => req.userId !== user2.id);
        should.not.exist(req);
      }));
  });

  it('Admin should not be able to get another\'s request', function* () {
    let {agent} = yield (adminPromise);
    yield (agent.get(COLLECTION_URL)
      .expect(200)
      .expect((res) => {
        let requests = res.body;
        let req = requests.find(req => req.userId !== admin.id);
        should.not.exist(req);
      }));
  });

  it('Super should be able to get another\'s request', function* () {
    let {agent} = yield (superPromise);
    yield (agent.get(COLLECTION_URL)
      .expect(200)
      .expect((res) => {
        let requests = res.body;
        let req = requests.find(req => req.userId !== superUser.id);
        should.exist(req);
      }));
  });

  it('Super should be able to count', function* () {
    let {agent} = yield (superPromise);
    yield (agent.get(`${COLLECTION_URL}/count`)
      .expect(200)
      .expect((res) => {
        let count = res.body;
        count.should.least(2);
      }));
  });

  after(() => ManageRequest.deleteAll({'id': {inq: requestsIds}}))
});
