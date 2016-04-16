import {api, user1, user1Promise, user2, user2Promise, adminPromise, admin, superPromise, superUser}
  from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import OBJECTS from  '../../../fixtures/fObject';
import REQUESTS from  '../../../fixtures/manageRequest';
import _ from 'lodash';
import {returnProperties} from '../../commonModel/helper'

let FObject = app.models.FObject;
let ManageRequest = app.models.ManageRequest;
const COLLECTION_URL = 'ManageRequests';
const OBJECT1 = OBJECTS.obj1;
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
    subjectId: OBJECT1.id
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
        })
    });
  });

  it('User not allowed to delete foreign request', () => {
    return adminPromise.then(({agent})=> {
      return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/delete`)
        .expect(401)
    });
  });

  it('User allowed to delete his request', () => {
    return user1Promise.then(({agent})=> {
      return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/delete`)
        .expect(200)
    }).then(() => {
        //cannot delete second time
        return user1Promise.then(({agent})=> {
          return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/delete`)
            .expect(403)
        })
      })
      .then(() => returnProperties(ManageRequest, REQUEST1.id, {status: ManageRequest.STATUS.ACTIVE}))
  });

  it('Super cannot delete request', () => {
    return superPromise.then(({agent})=> {
      return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/delete`)
        .expect(401)
    });
  });

  it('User cannot deny request', () => {
    return user1Promise.then(({agent})=> {
      return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/deny`)
        .expect(401)
    });
  });


  it('User cannot deny request', () => {
    return user1Promise.then(({agent})=> {
      return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/deny`)
        .expect(401)
    });
  });

  it('Super can deny request', () => {
    return superPromise.then(({agent})=> {
      return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/deny`)
        .expect(200)
    }).then(() => {
        //cannot deny second time
        return superPromise.then(({agent})=> {
          return agent.put(`${COLLECTION_URL}/${REQUEST1.id}/status/deny`)
            .expect(403)
        })
      })
      .then(() => returnProperties(ManageRequest, REQUEST1.id, {status: ManageRequest.STATUS.ACTIVE}))
  });

  after(() => ManageRequest.deleteById(NEW_REQUEST.id))
});
