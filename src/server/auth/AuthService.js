let url = require('url');

const CLIENTS = [/^https?:\/\/([\w.\-]+\.)?flaper\.org($|[\/\?])/];

export class AuthService {
  static ReturnTo(req) {
    //require here to prevent accessing App during app initialization
    let App = require('../../common/services/App.js').App;
    let returnTo = req.cookies['client_cb'];
    if (App.isProduction()) {
      let allowed = false;
      CLIENTS.forEach(client => allowed = allowed || client.test(returnTo));
      returnTo = allowed ? returnTo : null;
    }
    if (!returnTo) {
      let app = require('../server.js');
      const WEB_APP_URL = app.get('webApp').url;
      returnTo = `${WEB_APP_URL}/callback`;
    }
    return returnTo;
  }

  static WebAppLinkWithToken(accessToken, redirectUrl) {
    let redirect = url.parse(redirectUrl, true);

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
