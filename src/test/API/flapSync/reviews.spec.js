import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import {Flap} from '../../../../src/libs/flap/flap';
import {HAS_TOKEN} from './helper';

let should = require('chai').should();
let FObject = app.models.FObject;
const COLLECTION_URL = 'flapSync/reviews';
import _ from 'lodash';

describe(`/${COLLECTION_URL}`, function () {
  if (!HAS_TOKEN){
    it.skip(`Skip ${COLLECTION_URL} tests`);
    return;
  }
  updateTimeouts(this, 4);

  const FLAP_IDS = {
    ID1: 25085 // Оренбург, Муза Цвета
  };

  before(function* () {
    yield (Flap.syncObject(FLAP_IDS.ID1));
  });

  it('Sync reviews 2 times', function* () {
    let now = Date.now();
    let reviews = yield (Flap.syncReviews(FLAP_IDS.ID1));
    let reviews2 = yield (Flap.syncReviews(FLAP_IDS.ID1));
    reviews.length.should.eq(reviews2.length);
    for (let i = 0; i < reviews.length; i++) {
      let review = reviews[i];
      should.equal(review.id.toString(), reviews2[i].id.toString());
      review.created.getTime().should.lt(now);
      review.updated.getTime().should.lt(now);
    }
    let deniedReview = reviews.find(r=>r.status === 'denied');
    should.exist(deniedReview);
  });


  after(() => {
    let ids = [];
    _.forOwn(FLAP_IDS, (id) => ids.push(id));
    return FObject.deleteAll({'flap.id': {inq: ids}})
  })
});
