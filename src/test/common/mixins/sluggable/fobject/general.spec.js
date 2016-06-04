import app from '../../../../helpers/app';
let should = require('chai').should();
import OBJECTS from  '../../../../fixtures/fObject';
import _ from 'lodash';

let FObject = app.models.FObject;

describe(`Sluggable/FObject/@general`, function () {
  //start of the slug
  const SLUG1 = 'для-теста-slug';
  const TITLE1 = 'Для теста slug';
  const YEAR = 2011;

  const NEW_DELETED_FILM = {
    id: '1a7000000000000000010001',
    title: TITLE1,
    mainDomain: 'кино',
    status: FObject.STATUS.DELETED
  };
  const NEW_FILM1 = {
    id: '1a7000000000000000010002',
    title: TITLE1,
    mainDomain: 'кино',
    status: FObject.STATUS.ACTIVE
  };
  const NEW_FILM2 = {
    id: '1a7000000000000000010003',
    title: TITLE1,
    mainDomain: 'кино',
    status: FObject.STATUS.ACTIVE
  };

  const NEW_BOOK1 = {
    id: '1a7000000000000000010004',
    title: TITLE1,
    mainDomain: 'книги',
    status: FObject.STATUS.ACTIVE
  };

  const NEW_BOOK2 = {
    id: '1a7000000000000000010005',
    title: TITLE1,
    mainDomain: 'книги',
    status: FObject.STATUS.ACTIVE
  };

  const NEW_BOOK_WITH_YEAR = {
    id: '1a7000000000000000010006',
    title: TITLE1,
    mainDomain: 'книги',
    fields: {
      'год': YEAR
    },
    status: FObject.STATUS.ACTIVE
  };

  const NEW_BOOK_WITH_YEAR2 = {
    id: '1a7000000000000000010007',
    title: TITLE1,
    mainDomain: 'книги',
    fields: {
      'год': YEAR
    },
    status: FObject.STATUS.ACTIVE
  };

  const NEW_BOOK_WITH_YEAR3 = {
    id: '1a7000000000000000010008',
    title: TITLE1,
    mainDomain: 'книги',
    fields: {
      'год': YEAR + 1
    },
    status: FObject.STATUS.ACTIVE
  };


  let models = [NEW_DELETED_FILM, NEW_FILM1, NEW_FILM2, NEW_BOOK1, NEW_BOOK2, NEW_BOOK_WITH_YEAR,
    NEW_BOOK_WITH_YEAR2, NEW_BOOK_WITH_YEAR3];

  before(() => {
    let p = Promise.resolve();
    let options = {skipIgnore: {status: true}};
    models.forEach(model => {
      p = p.then(() => FObject.create(model, options));
    });
    return p;
  });

  it('Deleted object', () => {
    return FObject.findById(NEW_DELETED_FILM.id)
      .then((obj) => {
        //it is not required, just current logic - slug will be generated, although it will not influence others
        obj.slugLowerCase.should.eq(SLUG1);
      })
  });

  it('Film1', () => {
    return FObject.findById(NEW_FILM1.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(SLUG1);
      })
  });

  it('Film2', () => {
    return FObject.findById(NEW_FILM2.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-2`);
      })
  });

  it('Book1', () => {
    return FObject.findById(NEW_BOOK1.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(SLUG1);
      })
  });

  it('Book2', () => {
    return FObject.findById(NEW_BOOK2.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-2`);
      })
  });

  it('Book with year', () => {
    return FObject.findById(NEW_BOOK_WITH_YEAR.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-${YEAR}`);
      })
  });

  it('Book with year2', () => {
    return FObject.findById(NEW_BOOK_WITH_YEAR2.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-${YEAR}-2`);
      })
  });

  it('Book with year3', () => {
    return FObject.findById(NEW_BOOK_WITH_YEAR3.id)
      .then((obj) => {
        obj.slugLowerCase.should.eq(`${SLUG1}-${YEAR+1}`);
      })
  });

  after(()=> FObject.deleteAll({id: {inq: _.map(models, 'id')}}));
});
