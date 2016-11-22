import app from '../../../helpers/app';
import USERS from  '../../../fixtures/user.json';
let should = require('chai').should();
let UserExtra = app.models.UserExtra;
import moment from 'moment';

describe(`models/UserExtra`, function () {
  const userId = USERS.user1.id;
  const PREMIUM_SUPPORT = UserExtra.PROPERTIES.premiumSupport;
  const FLAP_ID = UserExtra.PROPERTIES.flapId;
  it("Should be able to set premium support and flapId", function*() {
    let date = moment().add(30, 'days').toDate();
    let flapId = 1;
    yield UserExtra.updateValue(userId, PREMIUM_SUPPORT, date);
    yield UserExtra.updateValue(userId, FLAP_ID, flapId);
    let userExtra = yield UserExtra.findOne({userId});
    should.exist(userExtra);
    should.exist(userExtra[PREMIUM_SUPPORT]);
    should.exist(userExtra[FLAP_ID]);
    userExtra[PREMIUM_SUPPORT].getTime().should.eq(date.getTime());
    userExtra[FLAP_ID].should.eq(flapId);
  });
});
