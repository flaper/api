import {Sanitize} from '@flaper/markdown';

export class SanitizeHelper {
  static observer(property, func) {
    return (ctx) => {
      return SanitizeHelper.sanitize(ctx, property, func);
    }
  }

  static sanitize(ctx, property, func) {
    //this prevent to create new field in dataset with empty / null / undefined value which will be converted to ''
    let wrapper = (obj) => {
      if (obj[property] !== undefined) {
        obj[property] = func(obj[property]);
      }
      return obj[property]
    };

    let value = null;
    if (ctx.instance) {
      //this is adding (POST)
      value = wrapper(ctx.instance);
    } else {
      //this is updating
      value = wrapper(ctx.data);
    }
    return Promise.resolve(value);
  }

  // alphaNumerical length
  static alphaMinLengthObserver(property, length) {
    return function (ctx) {
      let options = ctx.options || {};
      if (options.alphaMin === false) {
        return Promise.resolve();
      }
      let data = ctx.instance ? ctx.instance[property] : ctx.data[property];
      if (data !== undefined) {
        let len = Sanitize.symbolsNumber(data);
        if (len < length) {
          let message = `Минимальная длина ${length} значимых символов.`;

          let error = new Error(message);
          error.status = 400;
          error.code = `MIN_LENGTH_${property}`;
          return Promise.reject(error);
        }
      }
      return Promise.resolve();
    }
  }
}
