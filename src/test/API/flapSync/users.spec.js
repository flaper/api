import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import {Flap} from '../../../../src/libs/flap/flap';

let should = require('chai').should();
let User = app.models.user;
let UserIdentity = app.models.UserIdentity;
const COLLECTION_URL = 'flapSync/users';
import _ from 'lodash';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('users', ()=> {
    const ID1 = 7039418;
    const ID2 = 99;
    it('Sync new odnoklassniki user', function*() {
      yield (Flap.syncUser(ID1));
      let users = yield (User.find({where: {flapIds: ID1}}));
      let identities = yield (UserIdentity.find({where: {createdByFlapId: ID1}}));
      users.length.should.eq(1);
      identities.length.should.eq(1);
      // clearing data
      yield users[0].delete();
      yield identities[0].delete();
      should.not.exist(yield (User.findOne({where: {flapIds: ID1}})));
      should.not.exist(yield (UserIdentity.findOne({where: {createdByFlapId: ID1}})));
    });

    it('Sync two times should resolve to same user', function*() {
      yield (Flap.syncUser(ID1));
      yield (Flap.syncUser(ID1));
      let users = yield (User.find({where: {flapIds: ID1}}));
      let identities = yield (UserIdentity.find({where: {createdByFlapId: ID1}}));
      users.length.should.eq(1);
      identities.length.should.eq(1);
      // clearing data
      yield users[0].delete();
      yield identities[0].delete();
      should.not.exist(yield (User.findOne({where: {flapIds: ID1}})));
      should.not.exist(yield (UserIdentity.findOne({where: {createdByFlapId: ID1}})));
    });

    it('Sync should find stas user by email', function*() {
      yield (Flap.syncUser(ID2));
      let users = yield (User.find({where: {flapIds: ID2}}));
      users.length.should.eq(1);
    });
  });
});
