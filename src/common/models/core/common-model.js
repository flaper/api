import {timestampBehavior} from '../../behaviors/timestamps.js';

module.exports = (CommonModel) => {
  CommonModel.observe('before save', timestampBehavior);
  CommonModel.commonInit = (Model) => {
    disableSomeRemotes(Model);
    CommonModel.commonDisableRemoteScope(Model, 'scopeAll');
  };

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
