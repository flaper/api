import {ignoreProperties} from '../behaviors/propertiesHelper'

module.exports = (Model, options) => {
  Model.defineProperty('numberOfLikes', {type: "number", required: false, 'default': 0});
  Model.observe('before save', ignoreProperties({numberOfLikes: {}}));
};
