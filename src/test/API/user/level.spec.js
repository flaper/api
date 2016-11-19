import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import co from 'co';
let should = require('chai').should();

let {User, Story} = app.models;

const USERS = require('../../fixtures/user.json');
import STORIES from '../../fixtures/story.js';
const STORY1 = STORIES.test1;
let USER_ID = USERS.user_without_stories.id;

describe(`/users/@level`, function () {
  updateTimeouts(this);
  const NEW_STORY = {
    type: 'article',
    title: "Для тестирования уровня",
    content: STORY1.content,
    userId: USER_ID
  };

  function check(storiesNumber, level) {
    return co(function *() {
      let user = yield User.findById(USER_ID);
      user.storiesNumber.should.eq(storiesNumber);
      user.level.should.eq(level);
    });
  }


  it('0 уровень', function*() {
    check(0, 0);
  });

  it('уровни', function*() {
    let total = 0;

    function totalTo(i) {
      return co(function *() {
        let diff = i - total;
        while (diff--) yield Story.create(NEW_STORY);
      });
    }

    yield totalTo(1);
    check(1, 1);
    yield totalTo(4);
    check(4, 1);
    yield totalTo(5);
    check(5, 2);
    yield totalTo(9);
    check(9, 2);
    yield totalTo(10);
    check(10, 3);
  });

  after(function *() {
    yield Story.deleteAll({userId: USER_ID});
    Story.iSyncUser(USER_ID);
    check(0, 0);
  })
});
