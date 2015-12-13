import sanitizeHtml from 'sanitize-html';
//another strong option - var validator = require('validator');

export class Sanitize {
  static html(dirty) {
    return sanitizeHtml(dirty, {
      allowedTags: [],
      allowedAttributes: []
    });
  }

  static text(dirty) {
    return sanitizeHtml(dirty, {
      allowedTags: [],
      allowedAttributes: []
    });
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
    };

    if (ctx.instance) {
      //this is adding (POST)
      wrapper(ctx.instance);
    } else {
      //this is updating
      wrapper(ctx.data);
    }
    return Promise.resolve();
  }
}
