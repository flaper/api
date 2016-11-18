import {updateTimeouts} from '../../../helpers/init';
import {api} from '../../../helpers/api';
import app from '../../../helpers/app';
import STORIES from  '../../../fixtures/story';
import FOBJECTS from  '../../../fixtures/fObject';
import {Sanitize} from '@flaper/markdown';
let should = require('chai').should();

const OBJ1 = FOBJECTS.obj1;
const PLACE1 = FOBJECTS.place1;
const REVIEW1 = STORIES.review1;
const {Story, FObject} = app.models;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@reviews/get`, function () {
  updateTimeouts(this);
  describe('GET/HEAD', () => {
    it('Anonymous - allow access to the object reviews', function*() {
      yield api.get(COLLECTION_URL)
        .query({filter: {where: {objectId: OBJ1.id}}})
        .expect(200)
        .expect((res) => {
          let reviews = res.body;
          reviews.length.should.least(2);
          for (let review of reviews) {
            review.type.should.eq('review');
            review.status.should.eq('active');
            review.objectId.should.eq(OBJ1.id);
            review.domains.should.include(OBJ1.mainDomain);
            should.not.exist(review.region);
          }
        });
    });

    it('Place reviews should have region and domain', function*() {
      yield api.get(COLLECTION_URL)
        .query({filter: {where: {objectId: PLACE1.id}}})
        .expect(200)
        .expect((res) => {
          let reviews = res.body;
          reviews.length.should.least(1);
          for (let review of reviews) {
            review.type.should.eq('review');
            review.status.should.eq('active');
            review.objectId.should.eq(PLACE1.id);
            review.domains.should.include(PLACE1.mainDomain);
            review.region.should.eq(PLACE1.region);
          }
        });
    });

    it('Anonymous - allow access to the denied object reviews', function*() {
      yield api.get(COLLECTION_URL)
        .query({filter: {where: {objectId: OBJ1.id, status: Story.STATUS.DENIED}}})
        .expect(200)
        .expect((res) => {
          let reviews = res.body;
          reviews.length.should.least(1);
          for (let review of reviews) {
            review.type.should.eq('review');
            review.status.should.eq('denied');
            review.objectId.should.eq(OBJ1.id);
          }
        });
    });
  });

  describe('GET by slug', () => {
    it('Anonymous - allow access to the review by slug', function*() {
      let obj = yield FObject.findByIdRequired(REVIEW1.objectId);
      let review = yield Story.findByIdRequired(REVIEW1.id);
      yield api.get(`${COLLECTION_URL}/slug`)
        .query({slug: review.slug, before_slug: obj.getPath()})
        .expect(200)
        .expect((res) => {
          let r = res.body;
          r.slug.should.eq(review.slug);
          r.objectId.should.eq(REVIEW1.objectId);
        });
    });

    it('Anonymous - deny access to the review by slug without object path', function*() {
      let review = yield Story.findByIdRequired(REVIEW1.id);
      yield api.get(`${COLLECTION_URL}/slug`)
        .query({slug: review.slug})
        .expect(404);
    });
  });
});
