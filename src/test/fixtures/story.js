import {Sanitize} from '@flaper/markdown';
import app from '../../server/server';
import _ from 'lodash'

let Story = app.models.Story;

let stories = {
  test1: {
    "id": "1a4000000000000000001001",
    "type": 'article',
    "userId": "1a1000000000000000001001",
    "title": "Заголовок для теста",
    //this slug actually will be generated anyway, it just to use in test
    "slugLowerCase": "заголовок-для-теста",
    "content": "Тестовое содержимое image_holder ![](57c384bca5db9b354a007a4c) после картинки",
    "created": 1450716334311,
    "updated": 1450716334311
  },
  test2: {
    "id": "1a4000000000000000001002",
    "type": 'article',
    "userId": "1a1000000000000000001001",
    "title": "Заголовок для теста2",
    "content": "Тестовое содержимое2",
    "created": 1450718334311,
    "updated": 1450718334311
  },
  test3: {
    "id": "1a4000000000000000001003",
    "type": 'article',
    "userId": "1a1000000000000000001002",
    "title": "Заголовок для теста3",
    "content": "Тестовое содержимое3",
    "created": 1450616334311,
    "updated": 1450616334311
  },
  denied1: {
    "id": "1a4000000000000000001010",
    "type": 'article',
    "status": Story.STATUS.DENIED,
    "userId": "1a1000000000000000001001",
    "title": "Отклоненная статья",
    "content": "Содержимое отклоненной статьи."
  },
  deleted1: {
    "id": "1a4000000000000000001020",
    "type": 'article',
    "status": Story.STATUS.DELETED,
    "userId": "1a1000000000000000001001",
    "title": "Удаленная статья",
    "content": "Содержимое удаленной статьи."
  },
  withoutId: {
    "type": 'article',
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001001",
    "title": "Статья без id в фикстурах",
    "content": "Содержимое статьи без id в фикстурах."
  },
  //2 means second user
  withoutLikesUser3: {
    "type": 'article',
    "id": "1a4000000000000000001030",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001003",
    "title": "Статья без лайков",
    "content": "Содержимое статьи без лайков."
  },
  withoutActiveComments: {
    "type": 'article',
    "id": "1a4000000000000000001040",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001003",
    "title": "Статья без комментариев",
    "content": "Содержимое статьи без комментариев."
  },
  review1: {
    "type": 'review',
    "id": "1a4000000000000000002001",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001001",
    "title": "Название отзыва",
    "content": "Тестовый отзыв для объекта 1",
    "rating": 8,
    "objectId": '1a7000000000000000001001'
  },
  review2: {
    "type": 'review',
    "id": "1a4000000000000000002002",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001002",
    "title": "Название отзыва2",
    "content": "Тестовый отзыв2 для объекта 1",
    "rating": 9,
    "objectId": '1a7000000000000000001001'
  },
  review3: {
    "type": 'review',
    "id": "1a4000000000000000002003",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001001",
    "title": "Название отзыва3",
    "content": "Тестовый отзыв3 для объекта 2",
    "rating": 7,
    "objectId": '1a7000000000000000001002'
  },
  denied_review1: {
    "type": 'review',
    "id": "1a4000000000000000002004",
    "status": Story.STATUS.DENIED,
    "userId": "1a1000000000000000001001",
    "title": "Отклоненный отзыв",
    "content": "Отклоненный отзыв для объекта 1",
    "rating": 8,
    "objectId": '1a7000000000000000001001'
  },
  with_location1: {
    "type": 'review',
    "id": "1a4000000000000000002005",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001001",
    "title": "Отзыв из оренбурга",
    "content": "Отзыв про еду из оренбурга",
    "rating": 8,
    "objectId": '1a7000000000000000001007'
  },
  with_location2: {
    "type": 'review',
    "id": "1a4000000000000000002006",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001002",
    "title": "Отзыв из краснодара",
    "content": "Отзыв про еду из краснодара",
    "rating": 4,
    "objectId": '1a7000000000000000001003'
  },
  with_location3: {
    "type": 'review',
    "id": "1a4000000000000000002007",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001003",
    "title": "Отзыв из краснодара",
    "content": "Отзыв про развлечения из краснодара",
    "rating": 1,
    "objectId": '1a7000000000000000001003'
  },
  story_flag_cp: {
    "id": "1a4000000000000000002012",
    "type": 'article',
    "userId": "1a1000000000000000001001",
    "title": "flagCp",
    "content": "Содеражние фильма",
  }
};

_.forOwn(stories, (story) => {
  story.content = Sanitize.fakerIncreaseAlphaLength(story.content, Story.MIN_LENGTH[story.type])
});

export default stories;
