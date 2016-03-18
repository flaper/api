import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import fs from 'fs';
import * as _ from 'lodash';

module.exports = (ViewHistory) => {
  //const ALLOWED_MODELS = ['Story'];

  ViewHistory.commonInit(ViewHistory);
  ViewHistory.disableRemoteMethod('updateAttributes', false);
  ViewHistory.disableRemoteMethod('__get__subject', false);
  ViewHistory.disableRemoteMethod('__get__user', false);
  ViewHistory.disableRemoteMethod('exists', true);
  ViewHistory.disableRemoteMethod('deleteById', true);
  ViewHistory.disableRemoteMethod('findById', true);
  ViewHistory.disableRemoteMethod('create', true);
  ViewHistory.disableRemoteMethod('count', true);
  ViewHistory.disableRemoteMethod('find', true);

  ViewHistory.processDay = processDay;
  ViewHistory.remoteMethod('processDay', {
    http: {verb: 'post', path: '/processDay'},
    description: 'Register a view',
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
    exec('aws', ['s3', 'cp', `s3://flaper.views/data/${year}/${day}.zip`, '~/views.zip', '--region', 'eu-central-1']);
    exec('unzip', ['-o', '~/views.zip', '-d', '~/']);
    let content = fs.readFileSync('~/views.json', 'UTF8');
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
        periodType: 'day',
        period: period,
        values: _.pick(row, valuesFields)
      };
    });
  }

  function addMoney(data, visitorCost) {
    data.forEach(row => row.money = visitorCost * row.verifiedVisitors)
  }

  function totalMoney(time) {
    let Story = ViewHistory.app.models.Story;
    return Story.find({where: {status: Story.STATUS.ACTIVE, created: {lt: new Date(time)}}})
      .then(stories => 100 * Math.log10(1 + stories.length / 1000));
    /**
     * ~ 100 rubles per day for 10000 stories
     * ~ 30 rubles per day for 1000 stories
     * ~ 4 rubles per day for 100 stories
     */
  }

};
