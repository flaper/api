import {App} from '../../../services/App';

import _ from 'lodash';


module.exports = (Account) => {
  Account.commonInit(Account);

  Account.disableRemoteMethod('updateAttributes', false);
  Account.disableRemoteMethod('__get__subject', false);
  Account.disableRemoteMethod('__get__user', false);
  Account.disableRemoteMethod('exists', true);
  Account.disableRemoteMethod('deleteById', true);
  Account.disableRemoteMethod('create', true);
  Account.disableRemoteMethod('count', true);
  Account.disableRemoteMethod('find', true);

  Account.payment = payment;
  Account.remoteMethod('payment', {
    http: {verb: 'post', path: '/payment'},
    description: 'Make payment from id to id',
    accessType: 'WRITE',
    accepts: [
      {arg: 'fromId', type: 'objectId', description: 'From Id', required: true},
      {arg: 'toId', type: 'objectId', description: 'To Id', required: true},
      {arg: 'amount', type: 'number', description: 'Amount', required: true}
    ],
    returns: {arg: 'accounts', type: 'object'}
  });

  function payment(fromId, toId, amount) {
    let operatorId = App.isTestEnv() ? 0 : App.getCurrentUserId();
    let Transaction = Account.app.models.Transaction;
    let type = Transaction.TYPE.ADMIN_TRANSFERRING;
    return internalPayment({fromId, toId, amount, operatorId, type})
  }

  function internalPayment({fromId, toId, amount, operatorId = 0, type}) {
    let Transaction = Account.app.models.Transaction;
    let t1 = Transaction.create({fromId, toId, amount, operatorId, type});
    let connector = Account.dataSource.connector;
    let className = Account.sharedClass.name; //just 'Account' actually
    return t1.then(() => {
        let p1 = connector.collection(className).findOneAndUpdate({id: fromId},
          {$inc: {amount: -amount}}, {upsert: true});
        let p2 = connector.collection(className).findOneAndUpdate({id: toId},
          {$inc: {amount: amount}}, {upsert: true});
        return Promise.all([p1, p2]);
      })
      .then(() =>  Account.find({id: {inq: [fromId, toId]}}));
  }
};
