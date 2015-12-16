import {timestampBehavior} from '../../behaviors/timestamps.js';
import {findByIdRequired} from './methods/findIdByRequired'

module.exports = (CommonModel) => {
  CommonModel.observe('before save', timestampBehavior);
  CommonModel.commonInit = (Model) => {
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
      })
    });
  };

  CommonModel.findByIdRequired = findByIdRequired;

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
