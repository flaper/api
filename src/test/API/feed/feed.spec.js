import {updateTimeouts} from '../timeout';

import app from '../../helpers/app';
import supertest from 'supertest';
import defaults from 'superagent-defaults';

import STORIES from  '../../fixtures/story';
const STORY1 = STORIES.with_location1;
const STORY2 = STORIES.with_location2;
const STORY3 = STORIES.with_location3;

const PORT = app.get('port');
const API_URL = `http://0.0.0.0:${PORT}/`;
const COLLECTION_URL = 'feed';

let should = require('chai').should();
let expect = require('chai').expect;
let Story = app.models.Story;
let api = supertest(API_URL);

describe.only(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('getting the feed', () => {

    it('Anonymous should be able to get the feed', () => {
      return api.get(COLLECTION_URL)
        .expect(200)
        .expect(res => {
          let stories = res.body;
          expect(stories.length).to.be.equal(6);
        });
    });


    it('user should be able to get reviews from selected location', () => {
      return api.get(COLLECTION_URL)
      .query({region:"оренбург"})
      .expect(res => {
        let stories = res.body;
        expect(stories.length).to.be.equal(2);
      });
    })

    it('user should be able to get reviews from selected domain', () => {
      return api.get(COLLECTION_URL)
      .query({mainDomain:"еда"})
      .expect(res => {
        let stories = res.body;
        expect(stories.length).to.be.equal(2);
      });
    })
  })
});
