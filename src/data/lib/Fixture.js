import _ from 'lodash';
import app from '../../server/server';
import fs from 'fs';

let dataSource = app.dataSources.mongo;

/*
 /data/constants/ - data required for every application (production, test, development);
 /server/fixtures/ - sample data for development purposes only
 /test/fixtures/ - sample data for tests only
 */
export class Fixture {
  static TYPE_CONSTANTS() {
    return 'Constants';
  }

  static TYPE_ALL() {
    return 'All';
  }

  constructor(type) {
    this.type = type;
  }


  //upload new models
  simpleLoad(singleModelName, pluralModelName) {
    console.log(`Starting uploading ${pluralModelName}`);

    let values = this.readModels(pluralModelName);

    let upload = (checkIfExists = false) => this.uploadData(values, singleModelName, pluralModelName, checkIfExists);

    if (this.type === Fixture.TYPE_CONSTANTS()) {
      return upload(true);
    }
    if (this.type === Fixture.TYPE_ALL()) {
      let Model = app.models[singleModelName];
      return Model.destroyAll().then(upload);
    }
    throw 'Unsupported type';
  }

  uploadData(values, singleModelName, pluralModelName, checkIfExists = false) {
    let Model = app.models[singleModelName];

    //default implementation not using ids
    function findOrCreate(data) {
      let find;
      if (data.id) {
        find = Model.findById(data.id);
      } else {
        //query should be like {where: {and: [{a: 1}, {b: 1}, {c: 1}] }}
        let query = Object.keys(data).map((key)=> {
          return {[key]: data[key]}
        });
        query = {where: {and: query}};
        find = Model.findOne(query);
      }
      return find.then((result) => result ? Promise.resolve() : Model.create(data));
    }

    let callback = data => Model.create(data);
    callback = checkIfExists ? findOrCreate : callback;

    let promises = values.map(callback);
    return Promise.all(promises)
      .then(() => console.log(`${pluralModelName}' fixtures are loaded`))
      .catch((err) => console.error(`Error: ${err}`));
  }

  //to apply new indexes and upload new models
  migrate(singleModelName, pluralModelName) {
    return new Promise((resolve, reject) => {
      dataSource.autoupdate(singleModelName, () => {
        this.simpleLoad(singleModelName, pluralModelName)
          .catch(console.error)
          .then(resolve);
      });
    })
  }

  //private
  startProcessing() {
    const MODELS = {
      user: 'users',
      Role: 'roles',
      RoleMapping: 'roleMappings',
    };

    let promises = Object.keys(MODELS).map((modelName) => {
      let pluralName = MODELS[modelName];
      return this.migrate(modelName, pluralName);
    });
    return Promise.all(promises);
  }

  process() {
    return new Promise((resolve, reject) => {
      let object = this;

      function call() {
        object.startProcessing().then(resolve).catch(reject);
      }

      let res = dataSource.connected ? call() : dataSource.once('connected', call);
    });
  }

  readModels(pluralModelName) {
    let paths = this.paths();
    paths = paths.map((path) => __dirname + `/${path}/${pluralModelName}.json`);
    let modelsArrays = paths.map((path) => {
      if (!fs.existsSync(path)) {
        return [];
      }
      return _.values(require(path));
    });
    return modelsArrays.reduce((a, b) => a.concat(b))
  }

  paths() {
    switch (this.type) {
      case Fixture.TYPE_CONSTANTS():
        return ['../constants'];
      case Fixture.TYPE_ALL():
        return ['../constants', this.pathToFixtures()];
    }
    throw 'Wrong type';
  }

  pathToFixtures() {
    switch (process.env.NODE_ENV) {
      case 'test':
        return '../../test/fixtures';
      default:
        return '../../server/fixtures';
    }
  }
}
