import {Sanitize} from '../../../src/libs/sanitize/Sanitize';
import app from '../../server/server';
import _ from 'lodash'

let Story = app.models.Story;

let stories = {
  "test1": {
    "id": "1a4000000000000000001001",
    "userId": "1a1000000000000000001001",
    "title": "Заголовок для теста",
    "content": "Тестовое содержимое"
  },
  "test2": {
    "id": "1a4000000000000000001002",
    "userId": "1a1000000000000000001001",
    "title": "Заголовок для теста2",
    "content": "Тестовое содержимое2"
  },
  "test3": {
    "id": "1a4000000000000000001003",
    "userId": "1a1000000000000000001002",
    "title": "Заголовок для теста3",
    "content": "Тестовое содержимое3"
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
  }
};

_.forOwn(stories, (story) => {
  story.content = Sanitize.fakerIncreaseAlphaLength(story.content, Story.MIN_CONTENT_LENGTH)
});

export default stories;
