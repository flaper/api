let url = require('url');

export class AuthService {
  static WebAppLinkWithToken(accessToken) {
    let app = require('../server');
    const WEB_APP_URL = app.get('webApp').url;
    let redirect = url.parse(WEB_APP_URL, true);

    // this is needed or query is ignored. See url module docs.
    delete redirect.search;
    redirect.query = {
      jwt: JSON.stringify(accessToken)
    };
    // Put the url back together. It should now have params set.
    return url.format(redirect);
  }

  static passportConfig() {
    let app = require('../server');
    return app.get('passport');
  }
}
