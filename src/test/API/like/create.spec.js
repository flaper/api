import {api} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import LIKES from  '../../fixtures/like';
const LIKE_STORY1 = LIKES.like_story1;
let Like = app.models.Like;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/create`, function () {
  updateTimeouts(this);

  //it('Anonymous - allow access to the list', () => {
  //  return api.get(COLLECTION_URL)
  //    .expect(200)
  //    .expect((res) => {
  //      let likes = res.body;
  //      likes.length.should.least(4);
  //    })
  //});

});
