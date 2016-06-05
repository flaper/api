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

let FObject = app.models.FObject;
let User = app.models.User;
let ManageRequest = app.models.ManageRequest;
const COLLECTION_URL = 'ManageRequests';
const OBJECT_WITHOUT_MR = OBJECTS.obj_without_manage_requests;
const REQUEST1 = REQUESTS.request1;

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

  it('Status should be ignored when creating user', () => {
    return user1Promise.then(({agent})=> {
      return agent.post(COLLECTION_URL)
        .send(NEW_REQUEST)
        .expect(200)
        .expect((res) => {
          let request = res.body;
          request.status.should.eq(ManageRequest.STATUS.ACTIVE);
          request.userId.should.eq(user1.id);
          request.subjectId.should.eq(NEW_REQUEST.subjectId);
        })
    });
  });

  describe('Delete', () => {
    let url = `${COLLECTION_URL}/${REQUEST1.id}/status/delete`;

    it('User not allowed to delete foreign request', () => {
      return adminPromise.then(({agent})=> {
        return agent.put(url)
          .expect(401)
      });
    });

    it('User allowed to delete his request', () => {
      return user1Promise.then(({agent})=> {
        return agent.put(url)
          .expect(200)
      }).then(() => {
          //cannot delete second time
          return user1Promise.then(({agent})=> {
            return agent.put(url)
              .expect(403)
          })
        })
        .then(() => returnProperties(ManageRequest, REQUEST1.id, {status: ManageRequest.STATUS.ACTIVE}))
    });

    it('Super cannot delete request', () => {
      return superPromise.then(({agent})=> {
        return agent.put(url)
          .expect(401)
      });
    });
  });

  describe('Deny', () => {
    let url = `${COLLECTION_URL}/${REQUEST1.id}/status/deny`;

    it('User cannot deny request', () => {
      return user1Promise.then(({agent})=> {
        return agent.put(url)
          .expect(401)
      });
    });

    it('Super can deny request', () => {
      return superPromise.then(({agent})=> {
        return agent.put(url)
          .expect(200)
      }).then(() => {
          //cannot deny second time
          return superPromise.then(({agent})=> {
            return agent.put(url)
              .expect(403)
          })
        })
        .then(() => returnProperties(ManageRequest, REQUEST1.id, {status: ManageRequest.STATUS.ACTIVE}))
    });
  });

  describe('Approve', () => {
    let url = `${COLLECTION_URL}/${REQUEST1.id}/status/approve`;

    it('User cannot approve request', () => {
      return user1Promise.then(({agent})=> {
        return agent.put(url)
          .expect(401)
      });
    });

    it('Super can approve request, premium support should have 30 days', () => {
      let now = moment();
      return superPromise.then(({agent})=> {
          return agent.put(url)
            .expect(200)
        })
        .then(() => User.getExtra(REQUEST1.userId))
        .then(extra => {
          should.exist(extra.premiumSupport);
          should.exist(extra.objects);
          moment(extra.premiumSupport).diff(now, 'days').should.eq(30);
          extra.objects.should.include(REQUEST1.subjectId);
        })
        .then(() => ManageRequest.findById(REQUEST1.id))
        .then(request => {
          request.status.should.eq(ManageRequest.STATUS.APPROVED)
        })
        .then(() => User.updateExtraValue(user1.id, 'objects', []))
    });
  });


  after(() => ManageRequest.deleteById(NEW_REQUEST.id))
});
