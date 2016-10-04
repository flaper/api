import {Sanitize} from '@flaper/markdown';
import moment from 'moment-timezone';
import {ERRORS} from '../utils/errors';
import _ from 'lodash';

//mixin suppose that Model have 'status' property and 'active' status
module.exports = (Model, options) => {
  Model.observe('after save', auditable);

  function auditable(ctx) {
    return Promise.resolve();
  }
};
