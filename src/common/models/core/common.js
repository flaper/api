import _ from 'lodash';

export function disableAllRemotesExcept(Model, except = []) {
  let remotes = {
    count: true,
    create: true,
    createChangeStream: true,
    exists: true,
    deleteById: true,
    find: true,
    findById: true,
    findOne: true,
    replaceById: true,
    replaceOrCreate: true,
    updateAll: true,
    updateAttributes: false, // false - instance метод
    upsert: true,
    upsertWithWhere: true,
  };

  _.forOwn(remotes, (value, key) => {
    if (!except.includes(key)) {
      Model.disableRemoteMethod(key, value);
    }
  });
}

export function disableRemoteScope(Model, scope) {
  Model.disableRemoteMethod(`__get__${scope}`, true);
  Model.disableRemoteMethod(`__create__${scope}`, true);
  Model.disableRemoteMethod(`__delete__${scope}`, true);
  Model.disableRemoteMethod(`__count__${scope}`, true);
}

