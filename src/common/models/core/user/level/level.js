import co from 'co';
import _ from 'lodash';
import {ERRORS} from '../../../../utils/errors';

export function initLevels(User) {
  User.LEVELS = {
    STORY_TOTAL: {1: 1, 10: 2, 50: 3, 150: 4, 400: 5, 1000: 6, 2500: 7, 5000: 8, 10000: 9},
    STORY_LAST_MONTH: {2: 1, 5: 2, 15: 3, 40: 4, 70: 5},
  };
  User.calcLevel = calcLevel;

  function calcLevel({userId = null, storiesNumber = null, storiesLastMonth = null}) {
    return co(function*() {
      let userIdRequired = ()=> {
        if (!userId) throw ERRORS.badRequest('userId необходим для расчета уровня');
      };
      const {Story} = User.app.models;

      if (storiesNumber === null) {
        userIdRequired();
        storiesNumber = yield Story.count({userId: userId, status: Story.STATUS.ACTIVE});
      }

      if (storiesLastMonth === null) {
        userIdRequired();
        let monthAgo = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
        storiesLastMonth = yield Story.count({userId: userId, status: Story.STATUS.ACTIVE, created: {gt: monthAgo}});
      }
      let {LEVELS} = User;
      let level = 0;
      level += levelParams(LEVELS.STORY_TOTAL, storiesNumber);
      level += levelParams(LEVELS.STORY_LAST_MONTH, storiesLastMonth);
      return level;
    })
  }

  function levelParams(rules, value) {
    let level = 0;
    _.forOwn(rules, (lvl, key)=> {
      if (key <= value && lvl > level)
        level = lvl;
    });
    return level;
  }
}
