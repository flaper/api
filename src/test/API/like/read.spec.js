import {api} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import LIKES from  '../../fixtures/like';
const LIKE_STORY1 = LIKES.like_story1;
let Like = app.models.Like;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/read`, function () {
  updateTimeouts(this);

  it('Anonymous - allow access to the list', () => {
    return api.get(COLLECTION_URL)
      .expect(200)
      .expect((res) => {
        let likes = res.body;
        likes.length.should.least(4);
      })
  });

  it('Anonymous - allow count', () => {
    return api.get(`${COLLECTION_URL}/count`)
      .expect(200)
      .expect((res) => {
        let data = res.body;
        data.count.should.least(4);
      })
  });

  it('Anonymous - no access by id', () => {
    return api.get(`${COLLECTION_URL}/${LIKE_STORY1.id}`)
      .expect(404)
  });

  it('Anonymous - no exists', () => {
    return api.get(`${COLLECTION_URL}/${LIKE_STORY1.id}/exists`)
      .expect(404)
  });
});
