var env = process.env.NODE_ENV;
env = env ? env.toUpperCase() : null;
// In node.js env, polyfill might be already loaded (from any npm package),
// that's why we do this check.
if (env === 'TEST' && !global._babelPolyfill) {
  require('babel-core/register');
}
var loopback = require('loopback');
var boot = require('loopback-boot');
var passportService = require('./auth/passportService').default;

var app = module.exports = loopback();

app.start = function () {
  // start the web server
  return app.listen(function () {
    var envPrint = env ? ' (' + env + ')' : '';
    console.log('Web server%s listening at: %s', envPrint, app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;
  passportService(app);
  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
