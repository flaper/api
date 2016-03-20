import {findByIdRequired} from './methods/findMethods'

module.exports = (IdToType) => {
  IdToType.findByIdRequired = findByIdRequired;
  IdToType.prototype.findSubject = function () {
    let SubjectModel = IdToType.app.models[this.type];
    return SubjectModel.findById(this.id);
  }
};
