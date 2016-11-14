import app from '../../server/server';

let Poll = app.models.Poll;
let polls = {
  pollActive: {
    "id": "1a5000000000000000000001",
    "userId": "1a1000000000000000001001",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.POLL,
    "status": Poll.STATUS.ACTIVE,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  pollDenied: {
    "id": "1a5000000000000000000002",
    "userId": "1a1000000000000000001001",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.POLL,
    "status": Poll.STATUS.DENIED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  pollClosed: {
    "id": "1a5000000000000000000003",
    "userId": "1a1000000000000000001002",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.POLL,
    "status": Poll.STATUS.CLOSED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  pollDeleted: {
    "id": "1a5000000000000000000004",
    "userId": "1a1000000000000000001002",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.POLL,
    "status": Poll.STATUS.DELETED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  questionActive: {
    "id": "1a5000000000000000000005",
    "userId": "1a1000000000000000001001",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.QUESTION,
    "status": Poll.STATUS.ACTIVE,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  questionDenied: {
    "id": "1a5000000000000000000006",
    "userId": "1a1000000000000000001001",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.QUESTION,
    "status": Poll.STATUS.DENIED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  questionClosed: {
    "id": "1a5000000000000000000007",
    "userId": "1a1000000000000000001002",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.QUESTION,
    "status": Poll.STATUS.CLOSED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  questionDeleted: {
    "id": "1a5000000000000000000008",
    "userId": "1a1000000000000000001002",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.QUESTION,
    "status": Poll.STATUS.DELETED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "ответ",
      "ответ 2"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  voteActive: {
    "id": "1a5000000000000000000009",
    "userId": "1a1000000000000000001001",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.VOTING,
    "status": Poll.STATUS.ACTIVE,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [
      "1a1000000000000000001001"
    ],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  voteDenied: {
    "id": "1a5000000000000000000010",
    "userId": "1a1000000000000000001001",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.VOTING,
    "status": Poll.STATUS.DENIED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  voteClosed: {
    "id": "1a5000000000000000000011",
    "userId": "1a1000000000000000001002",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.VOTING,
    "status": Poll.STATUS.CLOSED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [],
    "created": 1450616334311,
    "updated": 1450616334311
  },
  voteDeleted: {
    "id": "1a5000000000000000000012",
    "userId": "1a1000000000000000001002",
    "title": "Тестовый опрос",
    "type": Poll.TYPE.VOTING,
    "status": Poll.STATUS.DELETED,
    "views": 0,
    "commentsNumber": 0,
    "responseNumber": 0,
    "lastActive": 1450616334311,
    "openDate": 1450616334311,
    "closeDate": 1450626334311,
    "answers": [],
    "created": 1450616334311,
    "updated": 1450616334311
  },
};
export default polls;
