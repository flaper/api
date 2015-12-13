import _ from 'lodash';

let USERS = require('./users.json');
let COMMONS = require('../../data/constants/users.json');
module.exports = _.merge(COMMONS, USERS);
