import {ERRORS} from '../../../utils/errors';

export function findByIdRequired(id, error = ERRORS.notFound) {
  return this.findById(id)
    .then((model) => {
      if (!model) {
        throw error(`${this.modelName} with id '${id}' not found`);
      }
      return model;
    });
}
