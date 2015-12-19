import sanitizeHtml from 'sanitize-html';
//another strong option - var validator = require('validator');

export class Sanitize {
  static html(dirty) {
    return sanitizeHtml(dirty, {
      allowedTags: [],
      allowedAttributes: []
    }).trim();
  }

  static text(dirty) {
    return sanitizeHtml(dirty, {
      allowedTags: [],
      allowedAttributes: []
    }).trim();
  }

  static observer(property, func) {
    return (ctx) => {
      return Sanitize.sanitize(ctx, property, func);
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

  static symbolsNumber(data) {
    let text = Sanitize.text(data);
    text = text.replace(/[^A-Za-z0-9а-яёА-ЯЁ]/g, '');
    return text.length;
  }

  //alphaNumerical length
  static alphaMinLengthObserver(property, length) {
    return function (ctx) {
      let data = ctx.instance ? ctx.instance[property] : ctx.data[property];
      if (data !== undefined) {
        let len = Sanitize.symbolsNumber(data);
        if (len < length) {
          let error = new Error(`Minimum length of ${property} is ${length}`);
          error.status = 400;
          error.code = 'EXCEPTION_MIN_LENGTH';
          return Promise.reject(error);
        }
      }
      return Promise.resolve();
    }
  }

  static fakerIncreaseAlphaLength(str, length) {
    let repeat = Math.ceil(length / Sanitize.symbolsNumber(str));
    //to prevent right strings be completed removed by e.g. unclosed <script> tag
    let s = Sanitize.text(str);
    let result = s;
    for (let i = 1; i < repeat; i++) result += '\n' + s;
    return result;
  }
}
