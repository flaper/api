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

export function ignoreProperties(descriptions) {
  return (ctx) => {
    if (!App.isWebServer()) {
      return Promise.resolve();
    }

    let skipFields = ctx.options.skipIgnore ? Object.keys(ctx.options.skipIgnore) : [];
    let properties = Object.keys(descriptions);
    properties = _.difference(properties, skipFields);
    if (ctx.instance) {
      properties.forEach((property) => {
        if (descriptions[property].newDefault) {
          ctx.instance[property] = descriptions[property].newDefault;
        } else {
          ctx.instance.unsetAttribute(property);
        }
      });
    } else {
      properties.forEach(property => delete ctx.data[property]);
    }
    return Promise.resolve();
  };
}
