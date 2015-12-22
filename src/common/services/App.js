let loopback = require('loopback'),
  app = require('../../server/server');
import {RoleService} from './roleService.js';

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

  static getCurrentUserId() {
    let context = loopback.getCurrentContext();
    if (!context) {
      //so it is console app.
      return null;
    }
    let accessToken = context.get('accessToken');
    return accessToken ? accessToken.userId : context.userId;
  }

  static getCurrentUser(workaroundUserId) {
    let User = app.models.User;
    let userId = workaroundUserId ? workaroundUserId : App.getCurrentUserId();
    return userId ? User.findById(userId) : Promise.resolve(null);
  }

  static isAdmin() {
    let userId = App.getCurrentUserId();
    return userId ? RoleService.isAdmin(userId) : Promise.resolve(false);
  }
}
