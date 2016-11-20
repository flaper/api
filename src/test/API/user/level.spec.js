import {api, user1, user1Promise, userAgentPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import co from 'co';
import _ from 'lodash';
let should = require('chai').should();

let {Story, Like} = app.models;
let User = app.models.user;
const USERS = require('../../fixtures/user.json');
import STORIES from '../../fixtures/story.js';
const STORY1 = STORIES.test1;
let USER_ID = USERS.user_without_stories.id;

describe(`/users/@level`, function () {
  updateTimeouts(this);

  describe('расчет', ()=> {
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

  describe('Ограничения на лайки', ()=> {
    const IDS = ['1a4000000000000000010101', '1a4000000000000000010102', '1a4000000000000000010103',
      '1a4000000000000000010104'];
    const NEW_USER = {
      "id": "1a1000000000000000010001",
      "username": "user-level-test",
      "email": "user-level@test.com",
      "password": "user-level",
      "displayName": "User"
    };
    let userPromise;
    const NEW_STORY = {
      type: 'article',
      title: "Для тестирования уровня",
      content: STORY1.content,
      userId: USER_ID
    };
    before(function*() {
      let promises = IDS.map(id=>Story.create(_.assign({id}, NEW_STORY)));
      yield promises;
      yield User.create(NEW_USER);
      userPromise = userAgentPromise(NEW_USER);
    });

    it('0 уровень, 2 лайка', function*() {
      let {agent} = yield userPromise;
      yield agent.post(`likes/${IDS[0]}`)
        .expect(200);
      yield agent.post(`likes/${IDS[1]}`)
        .expect(200);
      yield agent.post(`likes/${IDS[2]}`)
        .expect(403)
        .expect(res=> {
          let error = res.body.error;
          error.code.should.eq('likes_limit');
        });

      yield Like.deleteAll({userId: NEW_USER.id});
    });

    it('1 уровень, 3 лайка', function*() {
      let user = yield User.findByIdRequired(NEW_USER.id);
      user.level = 1;
      yield user.save();
      let {agent} = yield userPromise;
      yield agent.post(`likes/${IDS[0]}`)
        .expect(200);
      yield agent.post(`likes/${IDS[1]}`)
        .expect(200);
      yield agent.post(`likes/${IDS[2]}`)
        .expect(200);
      yield agent.post(`likes/${IDS[3]}`)
        .expect(403)
        .expect(res=> {
          let error = res.body.error;
          error.code.should.eq('likes_limit');
        });

      yield Like.deleteAll({userId: NEW_USER.id});
      user.level = 0;
      yield user.save();
    });

    after(function*() {
      yield Story.deleteAll({id: {inq: IDS}});
      yield Story.iSyncUser(USER_ID);
      yield User.deleteById(NEW_USER.id);
    })
  })
});
