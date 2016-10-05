import {App} from '../services/App.js';
import _ from 'lodash';
import co from 'co';

//mixin suppose that Model have 'status' property and 'active' status
module.exports = (Model, options) => {
  Model.observe('before save', auditableBefore);
  Model.observe('after save', auditable);

  function* auditableBefore(ctx) {
    let id = _.get(ctx, 'where.id');
    if (ctx.isNewInstance || !ctx.currentInstance)
      return;
    ctx.hookState.audit = {data: filter(ctx.currentInstance.__data), userId: ctx.currentInstance.userId}
  }

  function auditable(ctx) {
    let userId = App.getCurrentUserId();
    // асинхронный метод
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
      if (!count) {
        Audit.create({
          subjectId: id, userId: ctx.hookState.audit.userId, type, fields: oldData,
          created: ctx.instance.created
        });
      }
      // remove after update for getCurrentContext
      userId = userId || ctx.instance.userId;
      Audit.create({subjectId: id, userId, type, fields: diff, created: new Date()});
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
};
