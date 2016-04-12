import app from '../../server/server';

let FObject = app.models.FObject;

let fobjects = {
  "obj1": {
    "id": "1a7000000000000000001001",
    "title": "Тестовый объект1",
    //this slug actually will be generated anyway, it just to use in test
    "created": 1450716334311,
    "updated": 1450716334311
  },
  "obj2": {
    "id": "1a7000000000000000001002",
    "title": "Тестовый объект2",
    "created": 1450718334311,
    "updated": 1450718334311
  },
  "obj3": {
    "id": "1a7000000000000000001003",
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
