import co from 'co';

let generatorType = (function*() {
}).constructor;


export function coModel(Model){
  // adds support for generators to remoteMethod function
  let oldRemoteMethod = Model.remoteMethod;
  Model.remoteMethod = coRemoteMethod;
  function coRemoteMethod(name, ...params) {
    let fn = this[name];
    if (fn instanceof generatorType) {
      this[name] = co.wrap(fn);
    }
    let old = oldRemoteMethod.bind(this);
    old(name, ...params);
  }
}

export function extendFramework(loopback) {
  // adds support for generators to observe function
  let oldObserve = loopback.Model.observe;
  loopback.PersistedModel.observe = function (event, cb) {
    let c = cb instanceof generatorType ? co.wrap(cb) : cb;
    let old = oldObserve.bind(this);
    old(event, c);
  };

  // adds support for generators to remoteMethod function
  coModel(loopback.PersistedModel);
}
