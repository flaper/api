import {Sanitize} from '../../../src/libs/sanitize/Sanitize';
import app from '../../server/server';
import _ from 'lodash'

let Story = app.models.Story;

let stories = {
  "test1": {
    "id": "1a4000000000000000001001",
    "userId": "1a1000000000000000001001",
    "title": "Заголовок для теста",
    //this slug actually will be generated anyway, it just to use in test
    "slugLowerCase": "заголовок-для-теста",
    "content": "Тестовое содержимое",
    "created": 1450716334311,
    "updated": 1450716334311
  },
  "test2": {
    "id": "1a4000000000000000001002",
    "userId": "1a1000000000000000001001",
    "title": "Заголовок для теста2",
    "content": "Тестовое содержимое2",
    "created": 1450718334311,
    "updated": 1450718334311
  },
  "test3": {
    "id": "1a4000000000000000001003",
    "userId": "1a1000000000000000001002",
    "title": "Заголовок для теста3",
    "content": "Тестовое содержимое3",
    "created": 1450616334311,
    "updated": 1450616334311
  },
  "denied1": {
    "id": "1a4000000000000000001010",
    "status": Story.STATUS.DENIED,
    "userId": "1a1000000000000000001001",
    "title": "Отклоненная статья",
    "content": "Содержимое отклоненной статьи."
  },
  "deleted1": {
    "id": "1a4000000000000000001020",
    "status": Story.STATUS.DELETED,
    "userId": "1a1000000000000000001001",
    "title": "Удаленная статья",
    "content": "Содержимое удаленной статьи."
  },
  "withoutId": {
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001001",
    "title": "Статья без id в фикстурах",
    "content": "Содержимое статьи без id в фикстурах."
  },
  //2 means second user
  "withoutLikesUser3": {
    "id": "1a4000000000000000001030",
    "status": Story.STATUS.ACTIVE,
    "userId": "1a1000000000000000001003",
    "title": "Статья без лайков",
    "content": "Содержимое статьи без лайков."
  }
};

_.forOwn(stories, (story) => {
  story.content = Sanitize.fakerIncreaseAlphaLength(story.content, Story.MIN_CONTENT_LENGTH)
});

export default stories;
