import {user1, user2} from '../../../helpers/api';
import app from '../../../helpers/app';
let should = require('chai').should();
let Account = app.models.Account;
let Transaction = app.models.Transaction;

describe('models/money', function () {
  let transactionsBefore = null;
  before(() => {
    return Transaction.count({})
      .then(number => transactionsBefore = number);
  });

  it('Test payment', () => {
    let amount = 10;
    return Account.payment(user1.id, user2.id, amount)
      .then((accounts) => {
        accounts.length.should.eq(2);
        return Transaction.find({order: "created DESC"})
      })
      .then(transactions => {
        transactions.length.should.eq(transactionsBefore + 1);
        let t = transactions[0];//last transaction
        t.fromId.should.eq(user1.id);
        t.toId.should.eq(user2.id);
        t.amount.should.eq(amount);
      })
  });
});
