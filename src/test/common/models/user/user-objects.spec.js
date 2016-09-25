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

  it("Add objectId", function*() {
    yield (UserExtra.addObject(userId, OBJECTS.place1.id));
    let objs = yield (UserExtra.addObject(userId, OBJECTS.obj1.id));
    objs.length.should.least(2);
    objs.should.include(OBJECTS.place1.id);
    objs.should.include(OBJECTS.obj1.id);
    let extra = yield (User.getExtra(userId));
    true.should.eq(_.isEqual(extra.objects, objs));
  });

  it("Adding object multiple times should be ignored", function*() {
    yield (UserExtra.addObject(userId, OBJECTS.place1.id));
    let objects = yield (UserExtra.addObject(userId, OBJECTS.place1.id));
    let res = objects.filter(id => id === OBJECTS.place1.id);
    res.length.should.eq(1)
  });

  it("Removing objectId", function*() {
    yield (UserExtra.addObject(userId, OBJECTS.place1.id));
    yield (UserExtra.addObject(userId, OBJECTS.obj1.id));
    let objects = yield (UserExtra.removeObject(userId, OBJECTS.place1.id));
    let place1 = objects.find(id => id === OBJECTS.place1.id);
    let obj1 = objects.find(id => id === OBJECTS.obj1.id);
    should.not.exist(place1);
    should.exist(obj1);
  });

  after(() => UserExtra.updateValue(userId, 'objects', []))
});
