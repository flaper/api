import {timestampBehavior} from '../../behaviors/timestamps.js';
import {findByIdRequired, findOneRequired} from './methods/findMethods'
import _ from 'lodash';

module.exports = (CommonModel) => {
  CommonModel.observe('before save', timestampBehavior);
  CommonModel.commonInit = commonInit;
  CommonModel.disableAllRemotesExcept = disableAllRemotesExcept;

  function disableAllRemotesExcept(Model, except = []) {
    let remotes = {
      updateAttributes: false,
      exists: true,
      deleteById: true,
      findById: true,
      create: true,
      count: true,
      find: true
    };

    _.forOwn(remotes, (value, key) => {
      if (except.indexOf(key) === -1) {
        Model.disableRemoteMethod(key, value);
      }
    });
  }

  function commonInit(Model) {
    disableSomeRemotes(Model);
    CommonModel.commonDisableRemoteScope(Model, 'scopeAll');
    Model.on('attached', () => {
      //now scopes attached to the Model
      let scopes = Object.keys(Model.settings.scopes);
      scopes.forEach(scopeName => {
        let oldScope = Model[scopeName];
        oldScope.findByIdRequired = findByIdRequired;
        Object.defineProperty(Model, scopeName, {
          configurable: true,
          get: () => oldScope
        });
      });

      let oldFind = Model.find;
      Model.find = function (filter, ...params) {
        let f = filter ? filter : {};
        let limit = +f.limit;
        if (!limit) {
          f.limit = 100;
        } else if (limit > 1000) {
          f.limit = 1000;
        }
        return oldFind.call(this, f, ...params);
      }
    });
  }

  CommonModel.findByIdRequired = findByIdRequired;
  CommonModel.findOneRequired = findOneRequired;

  function disableSomeRemotes(Model) {
    Model.disableRemoteMethod('createChangeStream', true);
    Model.disableRemoteMethod('upsert', true);
    Model.disableRemoteMethod('updateAll', true);
    Model.disableRemoteMethod('findOne', true);
  }

  CommonModel.commonDisableRemoteScope = (Model, scope) => {
    Model.disableRemoteMethod(`__get__${scope}`, true);
    Model.disableRemoteMethod(`__create__${scope}`, true);
    Model.disableRemoteMethod(`__delete__${scope}`, true);
    Model.disableRemoteMethod(`__count__${scope}`, true);
  }

};
