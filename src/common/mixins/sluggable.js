import {Sanitize} from "../../libs/sanitize/Sanitize"
import moment from 'moment-timezone';
import {ERRORS} from '../utils/errors'
import _ from 'lodash'

//mixin suppose that Model have 'status' property and 'active' status
module.exports = (Model, options) => {
  const SLUG_SEPARATOR = '-';
  const MULTIPLE_SEPARATORS_REGEX = /-{2,}/g;

  Model.defineProperty('slug', {type: "string", required: false});
  Model.defineProperty('slugLowerCase', {type: "string", required: false});
  if (Model.settings.hidden === undefined) Model.settings.hidden = [];
  Model.settings.hidden.push('slugLowerCase');
  if (Model.settings.indexes === undefined) Model.settings.indexes = {};
  Model.settings.indexes.slug_index = {slugLowerCase: 1, status: 1};

  Model.getInitialSlug = Model.getInitialSlug || (model => model.title);
  Model.slugFilter = Model.slugFilter || (model => ({status: 'active'}));
  Model.actionFindBySlug = actionFindBySlug;

  Model.observe('before save', slugObserver);
  Model.observe('before activate', (model)=> {
    return generateSlugWrapper(model, Model.getInitialSlug(model));
  });


  Model.slugSuffixDate = slugSuffixDate;

  if (!Model.slugSuffix) {
    Model.slugSuffix = Model.slugSuffixDate;
  }

  Model.remoteMethod(
    'actionFindBySlug',
    {
      description: `Find an active model instance by slug`,
      http: {path: '/slug/:slug', verb: 'get'},
      accepts: [
        {arg: 'slug', type: 'string', required: true},
        {arg: 'fields', type: 'object', required: false}
      ],
      returns: {root: true},
      rest: {after: ERRORS.convertNullToNotFoundError}
    }
  );
  //we need to call slugObserver when creating new Model and activating status
  //another example maybe - when title has been changed (maybe after save hook)
  function slugObserver(ctx) {
    if (ctx.instance && ctx.isNewInstance) {
      return generateSlugWrapper(ctx.instance, Model.getInitialSlug(ctx.instance));
    }
    return Promise.resolve();
  }

  function slugSuffixDate(model) {
    let adds = [];
    let m = moment().tz('Europe/Moscow');
    adds.push(m.year());
    let month = (m.month() + 1).toString();
    month = month.length === 1 ? '0' + month : month;
    let date = m.date().toString();
    date = date.length === 1 ? '0' + date : date;
    adds.push(month);
    adds.push(date);
    return adds;
  }

  function generateSlugWrapper(model, str) {
    let adds = Model.slugSuffix(model);
    adds = adds.map(add => sanitizeString(add));
    adds = adds.filter(add => add);

    return generateSlug(model, str, adds);
  }

  function generateSlug(model, str, adds = []) {

    let baseSlug = sanitizeString(str);

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
        if (baseSlug) baseSlug += SLUG_SEPARATOR;
        baseSlug += adds.shift();
        slug = baseSlug;
      } else {
        ++postfix;
        slug = baseSlug + SLUG_SEPARATOR + postfix
      }
      slugLowerCase = slug.toLocaleLowerCase();
    }

    function nextIteration() {
      let query = Model.slugFilter(model);
      query.slugLowerCase = slugLowerCase;
      return Model.findOne({where: query})
        .then(instance => {
          if (!instance) {
            //we are happy
            return {slug, slugLowerCase};
          }
          nextSlug();
          return nextIteration();
        })
    }
  }

  function actionFindBySlug(slug, fields) {
    let query = {slugLowerCase: slug.toLocaleLowerCase(), status: 'active'};
    if (fields) {
      _.forOwn(fields, (value, key) => {
        if (typeof value === 'string' && !query[key]) {
          query[key] = value;
        }
      })
    }
    let filter = {where: query};
    return Model.findOne(filter);
  }

  function sanitizeString(str) {
    return Sanitize.text(str.toString()) //toString for integer .e.g
      .replace(/_/g, SLUG_SEPARATOR)
      .replace(/[^A-Za-z0-9а-яёА-ЯЁ_\-\s]/g, ' ')
      .trim()
      .replace(/[\s]/g, SLUG_SEPARATOR)
      .replace(MULTIPLE_SEPARATORS_REGEX, SLUG_SEPARATOR)
  }
};
