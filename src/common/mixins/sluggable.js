import {Sanitize} from "../../libs/sanitize/Sanitize"
import moment from 'moment-timezone';

module.exports = (Model, options) => {
  Model.defineProperty('slug', {type: "string", required: false});
  Model.defineProperty('slugLowerCase', {type: "string", required: false});

  Model.observe('before save', slugObserver);

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
};
