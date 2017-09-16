import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import fs from 'fs';
import * as _ from 'lodash';

module.exports = (ViewHistory) => {
  //const ALLOWED_MODELS = ['Story'];

  ViewHistory.PERIOD_TYPES = {
    day: 'day'
  };
  ViewHistory.commonInit(ViewHistory);
  ViewHistory.disableAllRemotesExcept(ViewHistory);

  ViewHistory.processDay = processDay;
  ViewHistory.remoteMethod('processDay', {
    http: {verb: 'post', path: '/processDay'},
    description: 'Process day',
    accessType: 'WRITE',
    accepts: [
      {arg: 'day', type: 'string', description: 'day', required: true}
    ],
    returns: {root: true}
  });

  function processDay(day) {
    let time = new Date(day);
    if (!day.match(/^\d{4}-\d\d-\d\d$/) || isNaN(time.getTime()) ||
      time < new Date('2016-03-14') || time > new Date()) {
      return ERRORS.badRequest();
    }


    let year = day.match(/^\d{4}/)[0];
    var exec = require('child_process').execFileSync;
    exec('aws', ['s3', 'cp', `s3://flaper.views/data/${year}/${day}.zip`, 'tmp/views.zip', '--region', 'eu-central-1']);
    exec('unzip', ['-o', 'tmp/views.zip', '-d', 'tmp']);
    let content = fs.readFileSync('tmp/views.json', 'UTF8');
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      return ERRORS.badRequest('Cannot parse data');
    }

    return totalMoney(time - 24 * 60 * 60)
      .then((money) => {
        let visitorCost = money / data.total.verifiedVisitors;
        data.total.money = money;
        addMoney(data.users, visitorCost);
        addMoney(data.objects, visitorCost);
        let records = makeRecords('user', data.users, day);
        insertRecords(records).then(() => {
            records = makeRecords('Story', data.objects, day);
            return insertRecords(records);
          })
          .then(() => {
            //here we add only 1 record - total
            let a = [data.total];
            let total = makeRecords('total', a)[0];
            total.subjectId = 0;
            return insertRecords([total]);
          });
        return Promise.resolve(data.total);
      });
  }

  function insertRecords(records) {
    let connector = ViewHistory.dataSource.connector;
    return new Promise((resolve, reject) => {
      //duplicated records will throw errors, but new records will be added successfully
      connector.collection('ViewHistory').insertMany(records, {ordered: false}, (error) => {
        resolve();
      });
    })
  }

  function makeRecords(type, data, period) {
    let valuesFields = ['views', 'visitors', 'verifiedVisitors', 'money'];
    return data.map(row => {
      return {
        subjectType: type,
        subjectId: row.id,
        periodType: ViewHistory.PERIOD_TYPES.day,
        period: period,
        values: _.pick(row, valuesFields)
      };
    });
  }

  function addMoney(data, visitorCost) {
    data.forEach(row => row.money = visitorCost * row.verifiedVisitors)
  }

  function totalMoney(time) {
    return 0;
  }

};
