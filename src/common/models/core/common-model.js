import {timestampBehavior} from '../../behaviors/timestamps.js';

module.exports = (CommonModel) => {
  CommonModel.observe('before save', timestampBehavior);
  CommonModel.commonInit = (Model) => {
    CommonModel.commonDisableRemoteScope(Model, 'scopeAll');
  };

  CommonModel.commonDisableRemoteScope = (Model, scope) => {
    Model.disableRemoteMethod(`__get__${scope}`, true);
    Model.disableRemoteMethod(`__create__${scope}`, true);
    Model.disableRemoteMethod(`__delete__${scope}`, true);
    Model.disableRemoteMethod(`__count__${scope}`, true);
  }
};
