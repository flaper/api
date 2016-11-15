import {updateTimeouts} from '../timeout';
import {api}  from '../../helpers/api.js';
import app from '../../helpers/app';

const COLLECTION_URL = 'Feed';

let should = require('chai').should();
let expect = require('chai').expect;
let {Story} = app.models;

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('GET', () => {

    it('Anonymous should be able to get the feed', function*() {
      let query = {type: "review", status: "active"},
        count = yield Story.count(query);
      return api.get(COLLECTION_URL)
        .query(query)
        .expect(200)
        .expect(res => {
          let stories = res.body;
          expect(stories.length).to.be.equal(count);
        });
    });
    it('Stories should be sorted by creation date', function*() {
      let query = {type: "review", status: "active"};
      return api.get(COLLECTION_URL)
        .query(query)
        .expect(200)
        .expect(res => {
          let stories = res.body;
          for (let i = 0; i < stories.length - 1; i++) {
            expect(stories[i + 1].created).to.be.at.most(stories[i].created);
          }
        });
    });

    it('user should be able to get reviews from selected location', function*() {
      let query = {region: "оренбург", type: "review", status: "active"},
        count = yield Story.count(query);
      return api.get(COLLECTION_URL)
      .query(query)
      .expect(res => {
        let stories = res.body;
        expect(stories.length).to.be.equal(count);
      });
  });


    it('user should be able to get reviews from selected domain', function*() {
      let query = {type: "review", status: "active", domain: "кино"},
        count = yield Story.count(query);
      return api.get(COLLECTION_URL)

      .query(query)
      .expect(res => {
        let stories = res.body;
        expect(stories.length).to.be.equal(count);
      });
  })
});
});
