import story from './story';

export default {
  "like_story1": {
    "id": "1a6000000000000000001001",
    "userId": "1a1000000000000000001002",
    "subjectId": story.test1.id,
    "subjectType": "Story",
    "subjectUserId": "1a1000000000000000001001"
  },
  "like_story2": {
    "userId": "1a1000000000000000001002",
    "subjectId": story.test2.id,
    "subjectType": "Story",
    "subjectUserId": "1a1000000000000000001001"
  },
  "like_story3": {
    "userId": "1a1000000000000000001001",
    "subjectId": story.test3.id,
    "subjectType": "Story",
    "subjectUserId": "1a1000000000000000001002"
  },
  "like_comment1": {
    "userId": "1a1000000000000000001002",
    "subjectId": "1a5000000000000000001001",
    "subjectType": "Comment",
    "subjectUserId": "1a1000000000000000001001"
  },
  "like_comment2": {
    "userId": "1a1000000000000000001002",
    "subjectId": "1a5000000000000000001002",
    "subjectType": "Comment",
    "subjectUserId": "1a1000000000000000001001"
  },
  "like_comment3": {
    "userId": "1a1000000000000000001001",
    "subjectId": "1a5000000000000000001003",
    "subjectType": "Comment",
    "subjectUserId": "1a1000000000000000001001"
  }
}
