import co from 'co';

let generatorType = (function*() {
}).constructor;

// adds support for generators to observe function
export function extendFramework(loopback) {
  var oldObserve = loopback.Model.observe;
  loopback.PersistedModel.observe = function (event, cb) {
    let c = cb instanceof generatorType ? co.wrap(cb) : cb;
    var old = oldObserve.bind(this);
    old(event, c);
  };
}
