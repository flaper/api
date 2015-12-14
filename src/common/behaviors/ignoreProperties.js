import {App} from '../services/App';
import {RoleService} from '../services/roleService.js';
import _ from 'lodash';

export function ignoreProperties(descriptions) {
  return (ctx) => {
    if (!App.isWebServer()) {
      return Promise.resolve();
    }

    let properties = Object.keys(descriptions);
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
