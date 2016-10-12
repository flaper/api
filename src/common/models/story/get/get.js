import {App} from '../../../services/App';
import {objectHasDeepKey} from '../../../utils/object';
import {ERRORS} from '../../../utils/errors'
import _ from 'lodash';

export function initGet(Story) {
  Story.disableRemoteMethod('find', true);
  Story.disableRemoteMethod('count', true);

  Story.commonDisableRemoteScope(Story, 'scopePublic');
  Story.commonDisableRemoteScope(Story, 'scopeActive');

  Story.customFind = customFind;
  Story.customCount = customCount;
  Story.actionFindBySlug = actionFindBySlug;

  Story.remoteMethod(
    'customFind',
    {
      http: {path: '/', verb: 'get'},
      description: `Возвращает все story удовлетваряющие фильтру, по умолчанию со статусом - '${Story.STATUS.ACTIVE}'.`,
      accessType: 'READ',
      accepts: {
        arg: 'filter',
        type: 'object',
        description: 'Filter defining fields, where, include, order, offset, and limit'
      },
      returns: {root: true}
    }
  );

  Story.remoteMethod('customCount', {
    http: {verb: 'get', path: '/count'},
    description: 'Count number of stories matched by where',
    accessType: 'READ',
    accepts: {arg: 'where', type: 'object', description: 'Criteria to match model instances'},
    returns: {arg: 'count', type: 'number'}
  });

  // Переопределяет метод по-умолчанию для sluggable.js
  Story.actionFindBySlug_remote = {
    description: `Поиск story по slug`,
    http: {path: '/slug', verb: 'get'},
    accepts: [
      {arg: 'slug', type: 'string', required: true},
      {arg: 'before_slug', type: 'string', required: false, description: 'Только для отзывов. Путь к объекту.'}
    ],
    returns: {root: true},
    rest: {after: ERRORS.convertNullToNotFoundError}
  };

  function customFind(filter) {
    filter = filter ? filter : {};
    filter.order = filter.order || 'created DESC';
    if (!_.get(filter, 'where') || !objectHasDeepKey(filter.where, 'status')) {
      //by default we return only active stories
      return Story.scopeActive(filter);
    }
    //but it is possible to request active and deleted as well
    return Story.scopePublic(filter);
  }

  function customCount(where) {
    if (!objectHasDeepKey(where, 'status')) {
      //be default we return only active stories
      return Story.scopeActive.count(where);
    }
    //but it is possible to request active and deleted as well
    return Story.scopePublic.count(where);
  }

  function* actionFindBySlug(slug, before_slug) {
    let userId = App.getCurrentUserId();
    let isAdmin = yield App.isAdmin();
    let slugLowerCase = slug.toLocaleLowerCase();
    // реальный slug не может принимать значения похожие на id, см. sluggable.js
    // следовательно передан id
    let isId = /^[0-9a-f]{24}$/.test(slugLowerCase);
    let query = isId ? {id: slugLowerCase} : {slugLowerCase, status: 'active'};
    if (before_slug) {
      const FObject = Story.app.models.FObject;
      let object = yield (FObject.actionFindByPath(before_slug));
      if (!object)
        throw ERRORS.badRequest('Объект к отзыву не может быть найден');
      query.objectId = object.id.toString();
    }
    let filter = {where: query};
    let story = yield (Story.findOne(filter));
    if (!story || !isId)
      return story;
    // isId === true
    if (story.status === Story.STATUS.DENIED ||
      story.status === Story.STATUS.DELETED && (isAdmin || story.userId.toString() === userId)) {
      return story;
    }
    return null;
  }
}
