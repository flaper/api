import {App} from '../../../services/App';

import _ from 'lodash';
import {TRANSACTIONS_TYPES} from '@flaper/consts';


module.exports = (Transaction) => {
  Transaction.commonInit(Transaction);
  Transaction.disableAllRemotesExcept(Transaction);

  Transaction.TYPE = TRANSACTIONS_TYPES;
};
