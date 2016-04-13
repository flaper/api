import app from '../../server/server';

let FObject = app.models.FObject;

let fobjects = {
  "obj1": {
    "id": "1a7000000000000000001001",
    "title": "Титаник",
    "mainDomain": "кино",
    "reviewsNumber": 401,
    "rating": 9.0,
    "fields": {
      'год': '1997',
      'бюджет': '$ 200000000',
      'трейлер': 'http://www.youtube.com/watch?v=8536J4n20xA',
      'сборы': '$ 2185240703',
      'продолжительность фильма': '194',
      'премьера': '1997-11-01'
    },
    "flap": {
      'id': 3327961
    },
    "created": 1450716334311,
    "updated": 1450716334311
  },
  "obj2": {
    "id": "1a7000000000000000001002",
    "title": "Русские блины",
    "mainDomain": 'место',
    "region": 'оренбург',
    "reviewsNumber": 121,
    "rating": 7.8,
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
      'id': 200190
    },
    "emails": ['orenblin@mail.ru'],
    "created": 1450718334311,
    "updated": 1450718334311
  },
  "obj3": {
    "id": "1a7000000000000000001003",
    "title": "Тестовый объект3",
    "created": 1450616334311,
    "updated": 1450616334311
  },
  "obj_without_domain": {
    "id": "1a7000000000000000001004",
    "title": "Тестовый объект3",
    "created": 1450616334311,
    "updated": 1450616334311
  },
  "deleted1": {
    "id": "1a7000000000000000001020",
    "status": FObject.STATUS.DELETED,
    "title": "Удаленный объект"
  }
};

export default fobjects;
