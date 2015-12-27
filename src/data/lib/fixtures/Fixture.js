import _ from 'lodash';
import app from '../../../server/server';
import fs from 'fs';
import PromiseQueue from "promise-queue"
import {lowerFirstLetter} from '../../../common/utils/string';
import {App} from '../../../common/services/App';
import {countNumberOfLikes} from './Like'

let dataSource = app.dataSources.mongo;

/*
 /data/constants/ - data required for every application (production, test, development);
 /server/fixtures/ - sample data for development purposes only
 /test/fixtures/ - sample data for tests only
 */
export class Fixture {
  /**
   * @return {string}
   */
  static TYPE_CONSTANTS() {
    return 'Constants';
  }

  /**
   * @return {string}
   */
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
      .catch((err) => console.error(`Uplodad ${singleModelName} error: ${JSON.stringify(err)}`));
  }

  //to apply new indexes and upload new models
  migrate(singleModelName, fileName) {
    return new Promise((resolve, reject) => {
      dataSource.autoupdate(singleModelName, () => {
        this.simpleLoad(singleModelName, fileName)
          .catch(console.error)
          .then(resolve);
      });
    })
  }

  //private
  uploadAllModels() {
    return new Promise((resolve, reject) => {
      //because e.g. Comments depends on Story to exist
      const modelGroups = [['IdToType', 'AccessToken', 'userIdentity'], ['user', 'Role', 'RoleMapping', 'Story', 'Image'], ['Comment'], ['Like']];
      let queue = new PromiseQueue(1, Infinity);

      modelGroups.forEach(group => {
        let nextPromise = () => {
          let promises = group.map((modelName) => {
            return this.migrate(modelName, lowerFirstLetter(modelName));
          });
          let promisesGroup = Promise.all(promises);

          promisesGroup.then(() => {
            if (queue.getQueueLength() === 0) {
              resolve();
            }
          }).catch(reject);

          return promisesGroup;
        };

        queue.add(nextPromise);
      });
    });
  }

  //private
  startProcessing() {
    return this.uploadAllModels()
      .then(countNumberOfLikes);
  }

  process() {
    return new Promise((resolve, reject) => {
      let object = this;

      function call() {
        App.fixturesStart();
        object.startProcessing()
          .then(() => {
            App.fixturesStop();
            resolve()
          }).catch(reject);
      }

      let res = dataSource.connected ? call() : dataSource.once('connected', call);
    });
  }

  readModels(fileName) {
    let ps = this.paths();
    ps = ps.map((path) => __dirname + `/${path}/${fileName}`);
    let paths = [];
    ps.forEach(p => {
      paths.push(p + '.json');
      paths.push(p + '.js')
    });


    let modelsArrays = paths.map((path) => {
      if (!fs.existsSync(path)) {
        return [];
      }
      let result = require(path);
      //depends json or export default
      result = /js$/.test(path) ? result.default : result;
      return _.values(result);
    });
    return modelsArrays.reduce((a, b) => a.concat(b))
  }

  paths() {
    switch (this.type) {
      case Fixture.TYPE_CONSTANTS():
        return ['../../constants'];
      case Fixture.TYPE_ALL():
        return ['../../constants', Fixture.PathToFixtures()];
    }
    throw 'Wrong type';
  }

  /**
   * @return {string}
   */
  static PathToFixtures() {
    switch (process.env.NODE_ENV) {
      case 'test':
        return '../../../test/fixtures';
      default:
        return '../../../server/fixtures';
    }
  }
}
