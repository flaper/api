import {App} from '../../../services/App';

import _ from 'lodash';


module.exports = (Transaction) => {
  Transaction.commonInit(Transaction);

  Transaction.TYPE = {
    ADMIN_TRANSFERRING: 0,
    VIEW: 1,
    CHARITY: 2,
    WITHDRAWAL: 3,
    BUSINESS_PAYMENT: 4
  };

  Transaction.disableRemoteMethod('updateAttributes', false);
  Transaction.disableRemoteMethod('__get__subject', false);
  Transaction.disableRemoteMethod('__get__user', false);
  Transaction.disableRemoteMethod('exists', true);
  Transaction.disableRemoteMethod('findById', true);
  Transaction.disableRemoteMethod('deleteById', true);
  Transaction.disableRemoteMethod('create', true);
  Transaction.disableRemoteMethod('count', true);
  Transaction.disableRemoteMethod('find', true);
};
