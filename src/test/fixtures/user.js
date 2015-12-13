import _ from 'lodash';

let USERS = require('./user.json');
let COMMONS = require('../../data/constants/user.json');
module.exports = _.merge(COMMONS, USERS);
