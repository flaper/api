import {timestampBehavior} from '../../behaviors/timestamps.js';

module.exports = (CommonModel) => {
  CommonModel.observe('before save', timestampBehavior);
};
