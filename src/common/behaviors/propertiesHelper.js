import {App} from '../services/App';
import _ from 'lodash';

export function setProperty(ctx, property, value) {
  if (ctx.instance) {
    ctx.instance[property] = value;
  } else {
    ctx.data[property] = value;
  }
  return Promise.resolve();
}

//ignore updates called via Model.updatedAttributes or Model.create
export function ignoreProperties(descriptions) {
  return (ctx) => {
    if (App.isFixturesLoading()) {
      return Promise.resolve();
    }

    let skipFields = ctx.options.skipIgnore ? Object.keys(ctx.options.skipIgnore) : [];
    let properties = Object.keys(descriptions);
    properties = _.difference(properties, skipFields);
    if (ctx.instance) {
      if (ctx.isNewInstance) {
        properties.forEach((property) => {
          let newDefault = descriptions[property].newDefault;
          if (newDefault !== undefined) {
            ctx.instance[property] = typeof(newDefault) === 'function' ? newDefault(ctx.instance) : newDefault;
          } else {
            ctx.instance.unsetAttribute(property);
          }
        });
      } else {
        /*When model.save called from inside app e.g.
         *just do nothing, leave everything as it is.
         * Otherwise, calling instance.unsetAttribute remove already saved property from db
         */
      }
    } else {
      //Model.updateAll && model.updateAttributes goes here
      properties.forEach(property => delete ctx.data[property]);
    }
    return Promise.resolve();
  };
}

export function ignoreUpdatedIfNoChanges(fields) {
  return (ctx) => {
    let Model = ctx.Model;

    if (ctx.data && ctx.where && ctx.where.id) {
      return Model.findById(ctx.where.id)
        .then(model => {
          let changes = false;
          fields.forEach(field => {
            changes = changes || ( (ctx.data[field] !== undefined) && (ctx.data[field] !== model[field]))
          });
          if (changes) {
            return Promise.resolve();
          }
          ctx.data.updated = model.updated;
        })
    }
    return Promise.resolve();
  }
}
