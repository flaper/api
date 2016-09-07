import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();

let Image = app.models.Image;
const COLLECTION_URL = 'images';

describe(`/${COLLECTION_URL}/get`, function () {
  updateTimeouts(this);

  it('Anonymous allow access to the list', () => {
    return api.get(COLLECTION_URL)
      .expect(200)
      .expect(res=> {
        let images = res.body;
        images.length.should.least(1);
      })
  });
});
