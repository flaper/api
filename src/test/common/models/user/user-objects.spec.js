import app from '../../../helpers/app';
import USERS from  '../../../fixtures/user.json';
import OBJECTS from  '../../../fixtures/fObject.js';
let should = require('chai').should();
let UserExtra = app.models.UserExtra;
let User = app.models.User;
import moment from 'moment';
import _ from 'lodash';

describe(`models/UserObjects`, function () {
  const userId = USERS.user1.id;

  it("Should be able to add objectId", () => {
    let objs;
    return UserExtra.addObject(userId, OBJECTS.place1.id)
      .then(() => UserExtra.addObject(userId, OBJECTS.obj1.id))
      .then(objects => {
        objects.length.should.least(2);
        objects.should.include(OBJECTS.place1.id);
        objects.should.include(OBJECTS.obj1.id);
        objs = objects;
      })
      .then(() => User.getExtra(userId))
      .then((extra) => _.isEqual(extra.objects, objs))
  });

  it("Adding object multiple times should be ignored", () => {
    return UserExtra.addObject(userId, OBJECTS.place1.id)
      .then(() => UserExtra.addObject(userId, OBJECTS.place1.id))
      .then(objects => {
        let res = objects.filter(id => id === OBJECTS.place1.id);
        res.length.should.eq(1)
      })
  });

  after(() => UserExtra.updateValue(userId, 'objects', []))
});
