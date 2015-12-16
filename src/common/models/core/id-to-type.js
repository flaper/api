import {findByIdRequired} from './methods/findIdByRequired'

module.exports = (IdToType) => {
  IdToType.findByIdRequired = findByIdRequired;
  IdToType.prototype.findSubject = function () {
    let SubjectModel = IdToType.app.models[this.type];
    return SubjectModel.findById(this.id);
  }
};
