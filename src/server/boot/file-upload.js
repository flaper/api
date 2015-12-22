var multiparty = require('multiparty');

module.exports = (server) => {
  //parsing multipart form parameters
  server.use((req, res, next) => {
    if (!req.is("multipart/form-data")) {
      return next();
    }
    var form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      for (let name in fields) {
        let value = fields[name];
        value = (value instanceof Array && value.length === 1) ? value[0] : null;
        req[name] = value;
      }
      var file = files ? files.file : null;
      if (file && file instanceof Array) {
        file = file[0];
      }
      req.file = file;
      next();
    });
  });
};
