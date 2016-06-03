import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import _ from 'lodash';

module.exports = (Account) => {
  Account.commonInit(Account);
  Account.disableAllRemotesExcept(Account);

  Account.payment = payment;
  Account.internalPayment = internalPayment;

  Account.ACCOUNTS = {
    FUND_VIEWS: 1,
    FUND_BEST: 100
  };

  Account.getAccountById = getAccountById;
  Account.getTransactions = getTransactions;

  Account.remoteMethod('payment', {
    http: {verb: 'post', path: '/payment'},
    description: 'Make payment from id to id',
    accessType: 'WRITE',
    accepts: [
      {arg: 'fromId', type: 'string', description: 'From Id', required: true},
      {arg: 'toId', type: 'string', description: 'To Id', required: true},
      {arg: 'amount', type: 'number', description: 'Amount', required: true}
    ],
    returns: {arg: 'accounts', type: 'object'}
  });

  Account.remoteMethod('getAccountById', {
    http: {verb: 'get', path: '/:id'},
    description: 'Get account',
    accessType: 'READ',
    accepts: [
      {arg: 'id', type: 'string', description: 'Id', required: true}
    ],
    returns: {arg: 'amount', type: 'object'}
  });

  Account.remoteMethod('getTransactions', {
    http: {verb: 'get', path: '/:id/transactions'},
    description: 'Get account',
    accessType: 'READ',
    accepts: [
      {arg: 'id', type: 'string', description: 'Id', required: true}
    ],
    returns: {root: true}
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
    let fId = fromId.toString();
    let tId = toId.toString();
    return t1.then(() => {
        let p1 = connector.collection(className).findOneAndUpdate({subjectId: fId},
          {$inc: {amount: -amount}}, {upsert: true});
        let p2 = connector.collection(className).findOneAndUpdate({subjectId: tId},
          {$inc: {amount: amount}}, {upsert: true});
        return Promise.all([p1, p2]);
      })
      .then(() =>  Account.find({where: {or: [{subjectId: fId}, {subjectId: tId}]}}));
  }

  function getTransactions(id) {
    let userId = App.getCurrentUserId();
    return App.isSuper()
      .then((isSuper) => {
        if (!isSuper && (id !== userId.toString())) {
          throw ERRORS.forbidden();
        }
        let Transaction = Account.app.models.Transaction;
        return Transaction.find({where: {or: [{fromId: id}, {toId: id}]}, order: 'created DESC'});
      });
  }

  function getAccountById(id) {
    let amount = null;
    let User = Account.app.models.user;
    let user = null;

    return Account.findOne({where: {subjectId: id}})
      .then(account => {
        amount = account ? account.amount : 0
      })
      .then(() => User.findByIdRequired(id))
      .then(u => user = u)
      .then(() => countRecentViewsMoney(id))
      .then(total => {
        let newbieBonus = Math.min(user.storiesNumber, 25);
        let res = total + amount + newbieBonus;
        return Math.round(res * 100) / 100
      })
  }

  function countRecentViewsMoney(userId) {
    let ViewHistory = Account.app.models.ViewHistory;
    let collection = ViewHistory.dataSource.connector.collection('ViewHistory');
    let match = {subjectType: 'user', subjectId: userId, periodType: ViewHistory.PERIOD_TYPES.day};
    return new Promise((resolve, reject) => {
      collection.aggregate([
        {$match: match},
        {
          $group: {
            _id: null,
            total: {$sum: "$values.money"}
          }
        }
      ], (err, data) => {
        let total = data.length === 1 ? data[0].total : 0;
        if (err) return reject(err);
        return resolve(total);
      });
    })
  }
};
