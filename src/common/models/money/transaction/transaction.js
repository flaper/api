import {App} from '../../../services/App';

import _ from 'lodash';


module.exports = (Transaction) => {
  Transaction.commonInit(Transaction);
  Transaction.disableAllRemotesExcept(Transaction);

  Transaction.TYPE = {
    ADMIN_TRANSFERRING: 0,
    VIEW: 1,
    CHARITY: 2,
    WITHDRAWAL: 3,
    BUSINESS_PAYMENT: 4
  };
};
