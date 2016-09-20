import {updateTimeouts} from '../../../helpers/init';
import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import app from '../../../helpers/app';
import STORIES from  '../../../fixtures/story';
import FOBJECTS from  '../../../fixtures/fObject';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import _ from 'lodash';

const OBJ1 = FOBJECTS.obj1;
const PLACE1 = FOBJECTS.place1;
const REVIEW1 = STORIES.review1;
const REVIEW2 = STORIES.review2;
const {Story, FObject} = app.models;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@reviews/get`, function () {
  updateTimeouts(this);
  describe('GET/HEAD', () => {
    it('Anonymous - allow access to the object reviews', () => {
      return api.get(COLLECTION_URL)
        .query({filter: {where: {objectId: OBJ1.id}}})
        .expect(200)
        .expect((res) => {
          let reviews = res.body;
          reviews.length.should.least(2);
          for (let review of reviews) {
            review.type.should.eq('review');
            review.status.should.eq('active');
            review.objectId.should.eq(OBJ1.id);
          }
        })
    });
    it('Anonymous - allow access to the denied object reviews', () => {
      return api.get(COLLECTION_URL)
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
        })
    });
  });

  describe('GET by slug', () => {
    it('Anonymous - allow access to the review by slug', function* () {
      let obj = yield (FObject.findByIdRequired(REVIEW1.objectId));
      let review = yield (Story.findByIdRequired(REVIEW1.id));
      yield (api.get(`${COLLECTION_URL}/slug`)
        .query({slug: review.slug, before_slug: obj.getPath()})
 	.expect(200)
        .expect((res) => {
          let r = res.body;
	  r.slug.should.eq(review.slug);
	  r.objectId.should.eq(REVIEW1.objectId);
        }));
    });
  });
});
