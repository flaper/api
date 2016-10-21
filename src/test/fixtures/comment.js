import story from './story';

export default {
  "comment1": {
    "id": "1a5000000000000000001001",
    "userId": "1a1000000000000000001001",
    "subjectId": story.test1.id,
    "subjectType": "Story",
    "content": "Первый комментарий",
    "created": 1458711384333
  },
  "comment2": {
    "id": "1a5000000000000000001002",
    "userId": "1a1000000000000000001001",
    "subjectId": story.test1.id,
    "subjectType": "Story",
    "content": "Второй комментарий",
    "created": 1458711484333
  },
  "comment3": {
    "id": "1a5000000000000000001003",
    "userId": "1a1000000000000000001002",
    "subjectId": story.test1.id,
    "subjectType": "Story",
    "content": "Третий комментарий",
    "created": 1458711584333
  },
  "comment4": {
    "id": "1a5000000000000000001004",
    "userId": "1a1000000000000000001001",
    "subjectId": story.test2.id,
    "subjectType": "Story",
    "content": "Первый комментарий про вторую статью",
    "created": 1458711684333
  },
  "deleted1": {
    "id": "1a5000000000000000001010",
    "status": "deleted",
    "userId": "1a1000000000000000001001",
    "subjectId": story.test1.id,
    "subjectType": "Story",
    "content": "Удаленный комментарий",
    "created": 1458711784333
  },
  //2 means second user
  "withoutLikesUser3": {
    "id": "1a5000000000000000001022",
    "userId": "1a1000000000000000001003",
    "subjectId": story.test1.id,
    "subjectType": "Story",
    "content": "Удаленный комментарий",
    "created": 1458711884333
  }
}
