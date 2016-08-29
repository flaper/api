import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import {Flap} from '../../../../src/libs/flap/flap';
import USERS_CONSTANTS from  '../../../../src/data/constants/user.json';
import USERS from  '../../fixtures/user.json';

let should = require('chai').should();
let User = app.models.user;
let UserIdentity = app.models.UserIdentity;
const COLLECTION_URL = 'flapSync/users';
import _ from 'lodash';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  const ID1 = 7039418;
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

  it('Sync should find existed user by email', function*() {
    let id = 99;
    yield (Flap.syncUser(id));
    let users = yield (User.find({where: {flapIds: id}}));
    users.length.should.eq(1);
    users[0].id.toString().should.eq(USERS_CONSTANTS.stas.id)
  });

  it('Sync should find existed odnoklassniki user', function*() {
    let id = 673311;
    yield (Flap.syncUser(id));
    let users = yield (User.find({where: {flapIds: id}}));
    users.length.should.eq(1);
    users[0].id.toString().should.eq(USERS.aigul.id)
  });

  it.skip('Sync should find existed facebook user', function*() {
    let id = 6972616;
    yield (Flap.syncUser(id));
    let users = yield (User.find({where: {flapIds: id}}));
    users.length.should.eq(1);
    users[0].id.toString().should.eq(USERS.yuriy.id)
  });
});
