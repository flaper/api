import {api} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import LIKES from  '../../fixtures/like';
const LIKE_STORY1 = LIKES.like_story1;
let Like = app.models.Like;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/DELETE`, function () {
  updateTimeouts(this);
  it('Anonymous - no delete by id', () => {
    return api.del(`${COLLECTION_URL}/${LIKE_STORY1.id}`)
      .expect(404)
  });
});
