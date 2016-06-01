let loopback = require('loopback'),
  app = require('../../server/server');
import {RoleService} from './roleService.js';

let isWebServer = false;
let fixturesLoading = false;

export class App {
  static env() {
    return process.env.NODE_ENV || 'development';
  }

  static isProduction() {
    return App.env() === 'production';
  }

  static isTestEnv() {
    return App.env() === 'test';
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

  static isSuper() {
    let userId = App.getCurrentUserId();
    return userId ? RoleService.isSuper(userId) : Promise.resolve(false);
  }

  ///fixtures
  static isFixturesLoading() {
    return fixturesLoading;
  }

  static fixturesStart() {
    fixturesLoading = true;
  }

  static fixturesStop() {
    fixturesLoading = false;
  }
}
