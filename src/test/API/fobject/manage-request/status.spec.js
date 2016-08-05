import {api, user1, user1Promise, user2, user2Promise, adminPromise, admin, superPromise, superUser}
  from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';
import REQUESTS from  '../../../fixtures/manageRequest';
import _ from 'lodash';
import moment from 'moment';
import {returnProperties} from '../../commonModel/helper'

let User = app.models.User;
let ManageRequest = app.models.ManageRequest;
const COLLECTION_URL = 'ManageRequests';
const OBJECT_WITHOUT_MR = OBJECTS.obj_without_manage_requests;
const REQUEST2 = REQUESTS.request2;

describe(`/${COLLECTION_URL}/@status`, function () {
  updateTimeouts(this);

  const NEW_REQUEST = {
    id: "1a8000000000000000010001",
    name: 'Josef Bush',
    position: 'Owner',
    status: ManageRequest.STATUS.APPROVED,
    phone: '1234567890',
    email: 'email@gmail.com',
    userId: user1.id,
    subjectId: OBJECT_WITHOUT_MR.id
  };

  it('Status should be ignored when creating user', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_REQUEST)
      .expect(200)
      .expect((res) => {
        let request = res.body;
        request.status.should.eq(ManageRequest.STATUS.ACTIVE);
        request.userId.should.eq(user1.id);
        request.subjectId.should.eq(NEW_REQUEST.subjectId);
      }));
  });

  describe('Delete', () => {
    let url = `${COLLECTION_URL}/${REQUEST2.id}/status/delete`;

    it('User not allowed to delete foreign request', function*() {
      let {agent} = yield (adminPromise);
      yield (agent.put(url)
        .expect(401));
    });

    it('User allowed to delete his request', function*() {
      let {agent} = yield (user2Promise);
      yield (agent.put(url)
        .expect(200));
      agent = (yield (user2Promise)).agent;
      yield (agent.put(url)
        .expect(403));
      yield  (returnProperties(ManageRequest, REQUEST2.id, {status: ManageRequest.STATUS.ACTIVE}));
    });

    it('Super cannot delete request', function*() {
      let {agent} = yield (superPromise);
      yield (agent.put(url)
        .expect(401));
    });
  });

  describe('Deny', () => {
    let url = `${COLLECTION_URL}/${REQUEST2.id}/status/deny`;

    it('User cannot deny request', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(url)
        .expect(401));
    });

    it('Super can deny request', function*() {
      let {agent} = yield (superPromise);
      yield (agent.put(url));
      agent = (yield (superPromise)).agent;
      yield (agent.put(url)
        .expect(403));
      yield (returnProperties(ManageRequest, REQUEST2.id, {status: ManageRequest.STATUS.ACTIVE}));
    });
  });

  describe('Approve', () => {
    let url = `${COLLECTION_URL}/${REQUEST2.id}/status/approve`;

    it('User cannot approve request', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(url)
        .expect(401));
    });

    it('Super can approve request, premium support should have 30 days', function*() {
      let now = moment();
      let extra = yield (User.getExtra(REQUEST2.userId));
      let before = extra.objects || [];
      let {agent} = yield (superPromise);
      yield (agent.put(url)
        .expect(200));
      extra = yield (User.getExtra(REQUEST2.userId));
      should.exist(extra.premiumSupport);
      should.exist(extra.objects);
      moment(extra.premiumSupport).diff(now, 'days').should.eq(30);
      extra.objects.should.include(REQUEST2.subjectId);
      let request = yield (ManageRequest.findById(REQUEST2.id));
      request.status.should.eq(ManageRequest.STATUS.APPROVED);
      yield (User.updateExtraValue(user1.id, 'objects', before));
      yield (returnProperties(ManageRequest, REQUEST2.id, {status: ManageRequest.STATUS.ACTIVE}));
    });
  });

  after(() => ManageRequest.deleteById(NEW_REQUEST.id))
});
