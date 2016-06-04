import app from '../../helpers/app';
let should = require('chai').should();
import _ from 'lodash';

//{properties = {status: 'active', commented: false}
export function returnProperties(Model, id, properties) {
  let keys = Object.keys(properties);
  let ignores = {};
  keys.forEach((key) => ignores[key] = true);

  return Model.findById(id)
    .then((model) => {
      _.assign(model, properties);
      return model.save({skipIgnore: ignores});
    })
    .then((model) => {
      keys.forEach((key) => model[key].should.eq(properties[key]));
    })
}
