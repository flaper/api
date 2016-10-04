import {timestampBehavior} from '../../behaviors/timestamps.js';
module.exports = (Audit) => {
  Audit.observe('before save', timestampBehavior);
};
