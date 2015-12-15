import {api} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();

let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';

//we check only for Comments, but it enough for all CommonModel descendants which call init
describe(`CommonModel/scopeAll`, function () {
  updateTimeouts(this);

  it('scopeAll should not exist', () => {
    return api.get(`${COLLECTION_URL}/scopeAll`)
      .expect(404)
  });

  it('scopeAll should not exist', () => {
    return api.post(`${COLLECTION_URL}/scopeAll`)
      .expect(404)
  });

  it('scopeAll should not exist', () => {
    return api.del(`${COLLECTION_URL}/scopeAll`)
      .expect(404)
  });

  it('scopeAll should not exist', () => {
    return api.get(`${COLLECTION_URL}/scopeAll/count`)
      .expect(404)
  });
});
