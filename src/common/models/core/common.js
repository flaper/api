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

export function disableRemoteScope(Model, scope, param = true) {
  Model.disableRemoteMethod(`__create__${scope}`, param);
  Model.disableRemoteMethod(`__count__${scope}`, param);
  Model.disableRemoteMethod(`__delete__${scope}`, param);
  Model.disableRemoteMethod(`__destroyById__${scope}`, param);
  Model.disableRemoteMethod(`__get__${scope}`, param);
  Model.disableRemoteMethod(`__findById__${scope}`, param);
  Model.disableRemoteMethod(`__link__${scope}`, param);
  Model.disableRemoteMethod(`__unlink__${scope}`, param);
  Model.disableRemoteMethod(`__updateById__${scope}`, param);
}

export function disableRemoteRelation(Model, relation, except = []) {
  let methods = ['create', 'link', 'unlink', 'exists', 'destroyById', 'findById', 'updateById', 'get', 'count',
    'delete'];
  for (let method of methods) {
    if (!except.includes(method))
      Model.disableRemoteMethod(`__${method}__${relation}`);
  }

}
