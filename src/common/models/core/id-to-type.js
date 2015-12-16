import {findByIdRequired} from './methods/findIdByRequired'

module.exports = (IdToType) => {
  IdToType.findByIdRequired = findByIdRequired;

};
