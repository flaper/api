import {updateTimeouts} from '../timeout';
import {api}  from '../../helpers/api.js';
import app from '../../helpers/app';

const COLLECTION_URL = 'Search';

let should = require('chai').should();

describe.skip(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  it('Filter 1', function*() {
    let filter = {where: {query: "муза", region: 'оренбург'}};
    yield api.get(COLLECTION_URL)
      .query({filter})
      .expect(200)
      .expect(res => {
        let result = res.body.hits;
        result.total.should.least(1);
        //  console.log(result.hits);
      });
  });
  it('Filter 2', function*() {
    let filter = {where: {query: "маша и медведь"}};
    yield api.get(COLLECTION_URL)
      .query({filter})
      .expect(200)
      .expect(res => {
        let result = res.body.hits;
        result.total.should.least(1);
        // console.log(result.hits);
      });
  });
});
