let loopback = require('loopback');
let _ = require('lodash');
import {AuthService} from './AuthService';

export default function (app) {
  // Create an instance of PassportConfigurator with the app instance
  let PassportConfigurator =
    require('loopback-component-passport').PassportConfigurator;
  let passportConfigurator = new PassportConfigurator(app);


  // Load the provider configurations
  var config = {};
  try {
    config = AuthService.passportConfig();
  } catch (err) {
    console.error('Please configure your passport strategy in' +
      '`providers.json`.');
    console.error('Copy `providers.json.template` to `providers.json` and  ' +
      'replace the clientID/clientSecret values with your own.');
    process.exit(1);
  }
  // Initialize passport
  let passport = passportConfigurator.init();

  // Set up related models
  passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential
  });
  // Configure passport strategies for third party auth providers
  for (var strategy in config) {
    var opts = config[strategy];
    opts.session = opts.session !== false;
    /* We can create a customCallback to set params on the callback url.
     // This will be called when the path is registered using
     // app.get("/callback/path", opts.customCallback);
     // inside passportConfigurator.configureProvider();
     // res, req, and next are passed in via express.*/
    opts.customCallback = customCallbackWrapper({strategy, opts, passport, app});

    passportConfigurator.configureProvider(strategy, opts);
  }
}

function customCallbackWrapper({strategy, opts, passport, app}) {
  const WEB_APP_URL = app.get('webApp').url;
  return (req, res, next) => {
    // Note that we have to only use variables that are in scope
    // right now, like opts.
    passport.authenticate(
      strategy, {
        session: false
      },
      //See http://passportjs.org/guide/authenticate/
      // err, user, and info are passed to this by passport
      function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          console.error('user not returned for passport.js');
          return res.redirect(WEB_APP_URL);
        }
        //we will set displayName && email when necessary
        updateUserWithInfo(user, info);

        let url = AuthService.WebAppLinkWithToken(info.accessToken);
        return res.redirect(url);
      }
    )(req, res, next);
  };
}

function updateUserWithInfo(user, info) {
  let changed = false;
  if (_.has(info, 'identity.profile.displayName')) {
    user.displayName = info.identity.profile.displayName;
    changed = true;
  }
  if (changed) {
    return user.save();
  }
}
