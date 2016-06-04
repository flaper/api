import app from '../../../helpers/app';
import USERS from  '../../../fixtures/user.json';
let should = require('chai').should();
let UserExtra = app.models.UserExtra;
import moment from 'moment';

describe(`models/UserExtra`, function () {
  const userId = USERS.user1.id;
  const PREMIUM_SUPPORT = UserExtra.PROPERTIES.premiumSupport;
  it("Should be able to set premium support", () => {
    let date = moment().add(30, 'days').toDate();
    return UserExtra.updateValue(userId, PREMIUM_SUPPORT, date)
      .then(() => UserExtra.findOne({userId}))
      .then(userExtra => {
        should.exist(userExtra);
        should.exist(userExtra[PREMIUM_SUPPORT]);
        userExtra[PREMIUM_SUPPORT].getTime().should.eq(date.getTime());
      })
  });
});
