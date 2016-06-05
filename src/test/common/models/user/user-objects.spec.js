import app from '../../../helpers/app';
import USERS from  '../../../fixtures/user.json';
import OBJECTS from  '../../../fixtures/fObject.js';
let should = require('chai').should();
let UserExtra = app.models.UserExtra;
import moment from 'moment';

describe(`models/UserObjects`, function () {
  const userId = USERS.user1.id;

  it("Should be able to add objectId", () => {
    return UserExtra.addObject(userId, OBJECTS.place1.id)
      .then(() => UserExtra.addObject(userId, OBJECTS.obj1.id))
      .then(extra => {
        extra.userId.should.eq(userId);
        extra.objects.length.should.least(2);
        extra.objects.should.include(OBJECTS.place1.id);
        extra.objects.should.include(OBJECTS.obj1.id);
      })
  });

  after(() => UserExtra.updateValue(userId, 'objects', []))
});
