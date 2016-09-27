import app from '../../server/server';

let FObject = app.models.FObject;

let fobjects = {
  obj1: {
    "id": "1a7000000000000000001001",
    "title": "Титаник",
    //this slug actually will be generated anyway, it just to use in test
    "slugLowerCase": 'титаник',
    "mainDomain": "кино",
    "fields": {
      'год': '1997',
      'бюджет': '$ 200000000',
      'трейлер': 'http://www.youtube.com/watch?v=8536J4n20xA',
      'сборы': '$ 2185240703',
      'продолжительность фильма': '194',
      'премьера': '1997-11-01'
    },
    "flap": {
      'id': 3327961,
      "reviewsNumber": 401,
      "rating": 9.0
    },
    "created": 1450716334311,
    "updated": 1450716334311
  },
  place1: {
    "id": "1a7000000000000000001002",
    "title": "Русские блины",
    "mainDomain": FObject.DOMAINS.PLACES,
    "region": 'оренбург',
    "slugLowerCase": 'русские-блины',
    "fields": {
      address: 'Ул. Володарского 14',
      phones: ['8-800-500-80-05 горячая линия', '31-26-27 единая справочная'],
      website: 'www.orenblin.ru',
      content: 'Испокон веков блины были излюбленным блюдом русской кухни. И по сей день, ' +
      'блины не утратили прежней актуальности.',
      location: {
        lat: '51.768182',
        lng: '55.101779'
      }
    },
    "flap": {
      'id': 200190,
      "reviewsNumber": 121,
      "rating": 7.8
    },
    "emails": ['orenblin@mail.ru'],
    "created": 1450718334311,
    "updated": 1450718334311
  },
  obj3: {
    "id": "1a7000000000000000001003",
    "title": "Тестовый объект3",
    "mainDomain": FObject.DOMAINS.PLACES,
    "created": 1450616334311,
    "updated": 1450616334311
  },
  obj_without_region: {
    "id": "1a7000000000000000001004",
    "title": "Тестовый объект3",
    "mainDomain": FObject.DOMAINS.PLACES,
    "created": 1450616334311,
    "updated": 1450616334311
  },
  obj_without_manage_requests: {
    "id": "1a7000000000000000001005",
    "title": "Объект без запросов на управление",
    "mainDomain": FObject.DOMAINS.PLACES
  },
  obj_without_owners: {
    "id": "1a7000000000000000001006",
    "title": "Объект без владельцев",
    "mainDomain": FObject.DOMAINS.PLACES
  },
  deleted1: {
    "id": "1a7000000000000000001020",
    "mainDomain": FObject.DOMAINS.PLACES,
    "status": FObject.STATUS.DELETED,
    "title": "Удаленный объект"
  }
};

export default fobjects;
