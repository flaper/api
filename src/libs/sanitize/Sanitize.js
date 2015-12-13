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

  //this prevent to create new field in dataset with empty / null / undefined value which will be converted to ''
  static oHtml(obj, property) {
    if (obj[property] !== undefined) {
      obj[property] = Sanitize.html(obj[property]);
    }
  }

  static oText(obj, property) {
    if (obj[property] !== undefined) {
      obj[property] = Sanitize.text(obj[property]);
    }
  }
}
