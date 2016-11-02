import {updateTimeouts} from '../timeout';
import {api}  from '../../helpers/api.js';
import app from '../../helpers/app';

const COLLECTION_URL = 'Feed';

let should = require('chai').should();
let expect = require('chai').expect;
let Story = app.models.Story;

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('getting the feed', () => {

    it('Anonymous should be able to get the feed', function* () {
      let query = {type:"review",status:"active"},
          count = yield Story.count(query);
      return api.get(COLLECTION_URL)
        .query(query)
        .expect(200)
        .expect(res => {
          let stories = res.body;
          expect(stories.length).to.be.equal(count);
        });
    });
    it('Stories should be sorted by creation date', function* () {
      let query = {type:"review",status:"active"},
          count = yield Story.count(query);
      return api.get(COLLECTION_URL)
        .query(query)
        .expect(200)
        .expect(res => {
          let stories = res.body;
          expect(stories[1].created).to.be.at.most(stories[0].created);
        });
    })

    it('user should be able to get reviews from selected location', function*(){
      let query = {region:"оренбург",type:"review",status:"active"},
          count = yield Story.count(query);
      return api.get(COLLECTION_URL)
      .query(query)
      .expect(res => {
        let stories = res.body;
        expect(stories.length).to.be.equal(count);
      });
    })

    it('user should be able to get reviews from selected domain', function*(){
      let query = {mainDomain:"еда",type:"review",status:"active",domain:"еда"},
          count = yield Story.count(query);
      return api.get(COLLECTION_URL)
      .query(query)
      .expect(res => {
        let stories = res.body;
        expect(stories.length).to.be.equal(count);
      });
    })
  })
});
