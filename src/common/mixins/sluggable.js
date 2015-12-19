import {Sanitize} from "../../libs/sanitize/Sanitize"
import moment from 'moment-timezone';
import {ERRORS} from '../utils/errors'

//mixin suppose that Model have 'status' property and 'active' status
module.exports = (Model, options) => {
  Model.defineProperty('slug', {type: "string", required: false});
  Model.defineProperty('slugLowerCase', {type: "string", required: false});
  if (Model.settings.hidden === undefined) Model.settings.hidden = [];
  Model.settings.hidden.push('slugLowerCase');
  if (Model.settings.indexes === undefined) Model.settings.indexes = {};
  Model.settings.indexes.slug_index = {slugLowerCase: 1, status: 1};

  Model.observe('before save', slugObserver);
  Model.observe('before activate', (model)=> {
    return generateSlugDate(model, model.title);
  });

  Model.actionFindBySlug = actionFindBySlug;
  Model.remoteMethod(
    'actionFindBySlug',
    {
      description: `Find an active model instance by slug`,
      http: {path: '/slug/:slug', verb: 'get'},
      accepts: [
        {arg: 'slug', type: 'string', required: true}
      ],
      returns: {root: true},
      rest: {after: ERRORS.convertNullToNotFoundError}
    }
  );
  //we need to call slugObserver when creating new Model and activating status
  //another example maybe - when title has been changed (maybe after save hook
  function slugObserver(ctx) {
    if (ctx.instance && ctx.isNewInstance) {
      return generateSlugDate(ctx.instance, ctx.instance.title);
    }
    return Promise.resolve();
  }


  function generateSlugDate(model, str) {
    let adds = [];
    let m = moment().tz('Europe/Moscow');
    adds.push(m.year());
    adds.push(m.month() + 1);
    adds.push(m.date());
    return generateSlug(model, str, adds);
  }

  function generateSlug(model, str, adds = []) {

    let baseSlug = Sanitize.text(str)
      .replace(/[^A-Za-z0-9а-яёА-ЯЁ_\-\s]/g, '')
      .replace(/[\s]/g, '_')
      .replace(/_{2,}/g, '_');
    let slug = baseSlug;
    let slugLowerCase = baseSlug.toLocaleLowerCase();
    let postfix = 1;
    //if empty
    if (!slug) nextSlug();

    return nextIteration()
      .then(data => {
        model.slug = slug;
        model.slugLowerCase = slugLowerCase;
        return data;
      });

    function nextSlug() {
      if (adds.length) {
        baseSlug += '_' + adds.shift();
        slug = baseSlug;
      } else {
        ++postfix;
        slug = baseSlug + '_' + postfix
      }
      slugLowerCase = slug.toLocaleLowerCase();
    }

    function nextIteration() {
      return Model.findOne({where: {slugLowerCase: slugLowerCase, status: 'active'}})
        .then(model => {
          if (!model) {
            //we are happy
            return {slug, slugLowerCase};
          }
          nextSlug();
          return nextIteration();
        })
    }
  }

  function actionFindBySlug(slug) {
    let query = {where: {slugLowerCase: slug.toLocaleLowerCase(), status: 'active'}};
    return Model.findOne(query);
  }
};
