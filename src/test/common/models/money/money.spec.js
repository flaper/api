import {user1, user2} from '../../../helpers/api';
import app from '../../../../server/server';
let should = require('chai').should();
let Account = app.models.Account;
let Transaction = app.models.Transaction;

describe('models/money', function () {
  before(() => {
    return Transaction.count({})
      .then(number => {
        number.should.be.eq(0);
      });
  });

  it('Test payment', () => {
    let amount = 10;
    return Account.payment(user1.id, user2.id, amount)
      .then((accounts) => {
        accounts.length.should.least(2);
        return Transaction.find().then((transactions) => {
          transactions.length.should.eq(1);
          let t = transactions[0];
          t.fromId.should.eq(user1.id);
          t.toId.should.eq(user2.id);
          t.amount.should.eq(amount);
        });
      });
  });

  after(()=> Transaction.deleteAll());
});
