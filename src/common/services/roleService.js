import _ from 'lodash';
import loopback from 'loopback';
let app = require('../../server/server');

let User, Role, RoleMapping;
let adminsPromise, supersPromise;
let adminIds, superIds;
let rolesToIds = {};
let roleIdToName = {};

//this class is used to hold roles in the memory to fast checking roles like 'admin' (isAdmin)
export class RoleService {
  static findUsersByRole(roleName) {
    return Role.findOne({where: {name: roleName}})
      .then((role) => RoleMapping.find({where: {roleId: role.id}}))
      .then((roleMappings) => roleMappings.map((roleMapping) => roleMapping.principalId));
  }

  static isAdmin(userId) {
    /* this is strange workaround, because in Nov 2015 continuation local storage was broken with promises chain
     * when multiple .then.then was used. So it broke loopback.getCurrentContext().
     * In futures that issues should be fixed naturally and workaround with setInterval can be removed
     */
    return new Promise((resolve, reject) => {
      let resolved = false;
      Promise.all([adminsPromise, supersPromise])
        .then(() => resolved = true);

      let fid = setInterval(() => {
        if (resolved) {
          let result = adminIds.indexOf(userId.toString()) > -1;
          clearInterval(fid);
          resolve(result);
        }
      }, 10);
    })
  }

  static setRole(userId, roleName) {
    return Role.findOne({where: {name: roleName}})
      .then(role => {
        if (!role) {
          let error = new Error('No such role');
          error.status = 404;
          return Promise.reject(error);
        }
        return User.findOne({where: {id: userId}})
          .then(user => {
            if (!user) {
              let error = new Error('No such user');
              error.status = 404;
              return Promise.reject(error);
            }

            let data = {
              principalType: RoleMapping.USER,
              principalId: userId
            };

            return RoleMapping.findOne({where: _.extend(data, {roleId: role.id})})
              .then((mapping) => {
                return mapping ? mapping : role.principals.create(data);
              });
          });
      })
      .then((result) => {
        RoleService.updateVariables();
        return result;
      })
  }

  static updateVariables() {
    adminsPromise = RoleService.findUsersByRole('admin');
    supersPromise = RoleService.findUsersByRole('super');
    adminIds = [];
    superIds = [];
    adminsPromise.then(ids => adminIds = adminIds.concat(ids));
    supersPromise.then(ids => {
      superIds = ids;
      adminIds = adminIds.concat(ids);
    });
    Role.find().then(roles => {
      rolesToIds = _.keyBy(roles, 'name');
      roleIdToName = _.keyBy(roles, 'id');
      roleIdToName = _.mapValues(roleIdToName, value => value.name);
    })
  }


  static init() {
    User = app.models.user;
    Role = app.models.Role;
    RoleMapping = app.models.RoleMapping;
    RoleService.updateVariables();
  }

  static getRoleNameById(id) {
    return roleIdToName[id];
  }
}


