import {ERRORS} from '../../../utils/errors';

export function findByIdRequired(id, filter, error = ERRORS.notFound) {
  return this.findById(id, filter)
    .then((model) => {
      if (!model) {
        throw error(`${this.modelName} with id '${id}' not found`);
      }
      return model;
    });
}

export function findOneRequired(params, error = ERRORS.notFound) {
  console.log('params', params);
  return this.findOne(params)
    .then((model) => {
      console.log('result');
      console.log(model);
      if (!model) {
        throw error(`${this.modelName} with query '${params.where}' not found`);
      }
      return model;
    });
}
