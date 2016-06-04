import app from '../../../../helpers/app';
let should = require('chai').should();
import OBJECTS from  '../../../../fixtures/fObject';
import _ from 'lodash';

let FObject = app.models.FObject;

describe(`Sluggable/FObject/@places`, function () {
  //start of the slug
  const SLUG1 = 'для-теста-slug';
  const TITLE1 = 'Для теста slug';
  const FIELDS = {
    address: {
      street: 'улица Терешковой',
      houseNumber: '13/1',
      extra: 'офис 365/3, домофон #12'
    }
  };

  const SLUGS = {
    street: 'улица-терешковой',
    houseNumber: '13-1'
  };

  const PLACE_NO_REGION = {
    id: '1a7000000000000000010101',
    title: TITLE1,
    mainDomain: FObject.DOMAINS.PLACES,
    status: FObject.STATUS.ACTIVE
  };

  const PLACE_NO_REGION2 = {
    id: '1a7000000000000000010102',
    title: TITLE1,
    mainDomain: FObject.DOMAINS.PLACES,
    status: FObject.STATUS.ACTIVE
  };

  const PLACE_NO_REGION3 = {
    id: '1a7000000000000000010103',
    title: TITLE1,
    mainDomain: FObject.DOMAINS.PLACES,
    fields: FIELDS,
    status: FObject.STATUS.ACTIVE
  };

  const PLACE_NO_REGION4 = {
    id: '1a7000000000000000010104',
    title: TITLE1,
    mainDomain: FObject.DOMAINS.PLACES,
    fields: FIELDS,
    status: FObject.STATUS.ACTIVE
  };

  const PLACE_NO_REGION5 = {
    id: '1a7000000000000000010105',
    title: TITLE1,
    mainDomain: FObject.DOMAINS.PLACES,
    fields: FIELDS,
    status: FObject.STATUS.ACTIVE
  };

  const PLACE1_REGION1 = {
    id: '1a7000000000000000010110',
    title: TITLE1,
    mainDomain: FObject.DOMAINS.PLACES,
    region: 'оренбург',
    status: FObject.STATUS.ACTIVE
  };

  const PLACE1_REGION2 = {
    id: '1a7000000000000000010120',
    title: TITLE1,
    mainDomain: FObject.DOMAINS.PLACES,
    region: 'москва',
    status: FObject.STATUS.ACTIVE
  };

  let models = [PLACE_NO_REGION, PLACE_NO_REGION2, PLACE_NO_REGION3, PLACE_NO_REGION4, PLACE_NO_REGION5,
    PLACE1_REGION1, PLACE1_REGION2];

  before(() => {
    let p = Promise.resolve();
    let options = {skipIgnore: {status: true}};
    models.forEach(model => {
      p = p.then(() => FObject.create(model, options));
    });
    return p;
  });

  it('Company without region', () => {
    return FObject.findById(PLACE_NO_REGION.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(SLUG1);
        should.exist(obj.region);
        obj.region.should.eq('');
      })
  });

  it('Company without region2', () => {
    return FObject.findById(PLACE_NO_REGION2.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-2`);
      })
  });

  it('Company without region3', () => {
    return FObject.findById(PLACE_NO_REGION3.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-${SLUGS.street}`);
      })
  });

  it('Company without region4', () => {
    return FObject.findById(PLACE_NO_REGION4.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-${SLUGS.street}-${SLUGS.houseNumber}`);
      })
  });

  it('Company without region5', () => {
    return FObject.findById(PLACE_NO_REGION5.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-${SLUGS.street}-${SLUGS.houseNumber}-2`);
      })
  });

  it('Company with region1', () => {
    return FObject.findById(PLACE1_REGION1.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(SLUG1);
      })
  });

  it('Company with region2', () => {
    return FObject.findById(PLACE1_REGION2.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(SLUG1);
      })
  });

  after(()=> FObject.deleteAll({id: {inq: _.map(models, 'id')}}));
});
