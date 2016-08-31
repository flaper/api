import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import {Flap} from '../../../../src/libs/flap/flap';

let should = require('chai').should();
let FObject = app.models.FObject;
const COLLECTION_URL = 'flapSync/reviews';
import _ from 'lodash';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  const FLAP_IDS = {
    ID1: 23187, // Оренбург, Национальная деревня
    ID2: 3329255,
    ID3: 4484301,
    ID_CLOSED: 21920
  };

  before(function* () {
    yield (Flap.syncObject(FLAP_IDS.ID1));
    return 123;
  });

  it('Sync reviews', function* () {
    let data = yield (Flap.syncReviews(FLAP_IDS.ID1));
    data.length.should.least(50);
  });


  after(() => {
    let ids = [];
    _.forOwn(FLAP_IDS, (id) => ids.push(id));
    return FObject.deleteAll({'flap.id': {inq: ids}})
  })
});
