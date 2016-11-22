import {api, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();

let Comment = app.models.Comment;

const COLLECTION_URL = 'comments';

//we check only for Comments, but it enough for all CommonModel descendants which call init
describe(`CommonModel/scopeAll`, function () {
  updateTimeouts(this);

  it('get should not exist', function*() {
    return api.get(`${COLLECTION_URL}/scopeAll`)
      .expect(404)
  });

  it('post should not exist', function*(){
    return api.post(`${COLLECTION_URL}/scopeAll`)
      .expect(404)
  });

  it('del should not exist', function*(){
    let {agent} = yield adminPromise;
    return agent.delete(`${COLLECTION_URL}/scopeAll`)
      //why 401 unknown
      .expect(404)
  });

  it('count should not exist', function*() {
    return api.get(`${COLLECTION_URL}/scopeAll/count`)
      .expect(404)
  });
});
