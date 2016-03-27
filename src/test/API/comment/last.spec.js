import {api} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';

let STORY1 = STORIES.test1;
let STORY2 = STORIES.test2;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/last`, function () {
  updateTimeouts(this);

  it('Return last comments for each subject ID', () => {
    return api.get(`${COLLECTION_URL}/last`)
      .query({ids: JSON.stringify([STORY1.id, STORY2.id])})
      .expect(200)
      .expect((res) => {
        let commentsGroups = res.body;
        Object.keys(commentsGroups).length.should.eq(2);
        let comments1 = commentsGroups[STORY1.id];
        let comments2 = commentsGroups[STORY2.id];
        should.exist(comments1);
        should.exist(comments2);
        comments1.length.should.least(3);
        comments2.length.should.least(1);
      })
  });
});
