let loopback = require('loopback'),
  app = require('../../server/server');

let isWebServer = false;

export class App {
  static setCurrentUser(userId) {
    let ctx = loopback.getCurrentContext();
    if (ctx) {
      ctx.userId = userId;
    }
  }

  static isWebServer() {
    if (!isWebServer) {
      //when we have many observers, context just disappearing sometimes
      isWebServer = loopback.getCurrentContext() ? true : false;
    }
    return isWebServer;
  }

  static getCurrentUser() {
    let User = app.models.User;
    let context = loopback.getCurrentContext();
    if (!context) {
      //so it is console app.
      return Promise.resolve(null);
    }
    let accessToken = context.get('accessToken');
    let userId = accessToken ? accessToken.userId : context.userId;
    if (!userId) {
      return Promise.resolve(null);
    }
    return User.findById(userId);
  }
}
