let loopback = require('loopback');
let _ = require('lodash');
import {AuthService} from './AuthService';

export default function (app) {
  var cookieParser = require('cookie-parser');
  app.use(cookieParser());

  app.use('/auth/:provider', (req, res, next) => {
    let cb = req.query.cb;
    res.cookie('client_cb', cb, {maxAge: 900000, httpOnly: true});
    next();
  });

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
  return (req, res, next) => {
    let returnTo = AuthService.ReturnTo(req);
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
          return res.redirect(returnTo);
        }
        //we will set displayName && email when necessary
        updateUserWithInfo(user, info);
        let url = AuthService.WebAppLinkWithToken(info.accessToken, returnTo);
        return res.redirect(url);
      }
    )(req, res, next);
  };
}

function updateUserWithInfo(user, info) {
  let changed = false;
  if (_.has(info, 'identity')) {
    let identity = info.identity;
    updateField('displayName', 'identity.profile.displayName');
    //actually always should be true
    switch (info.identity.provider) {
      case 'mail-login':
        updateField('photo', 'identity.profile._json.pic_50');
        updateField('photoLarge', 'identity.profile._json.pic_190');
        break;
      case 'facebook-login':
        user.photo = `http://graph.facebook.com/${identity.externalId}/picture?type=square`;
        user.photoLarge = `http://graph.facebook.com/${identity.externalId}/picture?type=large`;
        break;
      case 'vk-login':
        let photos = _.get(identity, 'profile.photos');
        if (photos) {
          let photosIndex = _.keyBy(photos, 'type');
          updateField('photo', 'photo.value', photosIndex);
          updateField('photoLarge', 'photo_200_orig.value', photosIndex);
        }
        break;
      case 'odnoklassniki-login':
        updateField('photo', 'identity.profile.photos[0].value');
        updateField('photoLarge', 'identity.profile.photos[1].value');
        break;
      case 'google-login':
        let value = updateField('photo', 'identity.profile.photos[0].value');
        if (value) {
          user.photoLarge = value.replace('?sz=50', '');
        }
        break;
      default:
        updateField('photo', 'identity.profile.photos[0].value');
        updateField('photoLarge', 'identity.profile.photos[0].value');
        break;
    }

    if (changed) {
      return user.save();
    }
  }


  function updateField(field, path, data = null) {
    data = data ? data : info;
    let value = _.get(data, path);
    if (value) {
      user[field] = value;
      changed = true;
    }
    return value;
  }
}
