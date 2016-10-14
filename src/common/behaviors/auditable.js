import {App} from '../services/App.js';
import _ from 'lodash';
import co from 'co';

// auditable suppose that Model have 'status' property and 'active' status
// not a mixins because of getCurrentContext issues
export function enableAudit(Model, options) {
  Model.observe('before save', auditableBefore);
  Model.observe('after save', auditable);

  function* auditableBefore(ctx) {
    // workaround for getCurrentContext
    ctx.hookState.currentUserId = App.getCurrentUserId();
    if (ctx.isNewInstance || !ctx.currentInstance)
      return;
    ctx.hookState.audit = {data: filter(ctx.currentInstance.__data), userId: ctx.currentInstance.userId}
  }

  // асинхронный метод
  function auditable(ctx) {
    if (ctx.isNewInstance || !ctx.hookState.audit || !ctx.instance)
      return Promise.resolve();
    let oldData = ctx.hookState.audit.data;
    let newData = filter(ctx.instance);
    let diff = calcDiff(newData, oldData);
    if (!Object.keys(diff).length)
      return Promise.resolve();
    let id = ctx.instance.id;
    let type = Model.sharedClass.name;
    co.wrap(saveDiff)();
    return Promise.resolve();

    function *saveDiff() {
      let {Audit} = Model.app.models;
      let count = yield (Audit.count({subjectId: id}));
      var promises = [];
      if (!count) {
        promises.push(Audit.create({
          subjectId: id, userId: ctx.hookState.audit.userId, type, fields: oldData,
          created: ctx.instance.created
        }));
      }
      let userId = ctx.hookState.currentUserId;
      promises.push(Audit.create({subjectId: id, userId, type, fields: diff, created: new Date()}));
      yield (promises);
      let newCount = yield (Audit.count({subjectId: id}));
      let model = yield (Model.findById(id));
      model.auditsNumber = newCount;
      yield (model.save({skipIgnore: {auditsNumber: true}}));
    }
  }


  function filter(data) {
    return _.pick(data, options.pick);
  }

  function calcDiff(newData, oldData) {
    let diff = _.pickBy(newData, (value, key)=> value !== oldData[key]);
    _.forOwn(oldData, (value, key)=> {
      if (newData[key] === undefined)
        diff[key] = null;
    });
    return diff;
  }
}
