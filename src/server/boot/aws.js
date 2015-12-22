module.exports = (app) => {
  let config = app.get('aws');
  let AWS = require('aws-sdk');
  AWS.config.region = config.region;
  AWS.config.update({accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey});
};
