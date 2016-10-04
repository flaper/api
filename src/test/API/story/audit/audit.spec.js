import {api, user1, user1Promise, user2, user2Promise, adminPromise, superPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';

let {Account, Story} = app.models;

let STORY1 = STORIES.test1;
let STORY2 = STORIES.test2;

const COLLECTION_URL = 'stories';

describe(`${COLLECTION_URL}/@audit`, function () {
  updateTimeouts(this);

  const NEW_STORY = {
    id: '1a4000000000000000010001',
    type: 'article',
    title: "New story for test",
    content: STORY1.content
  };

  it('User - allow to add', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_STORY)
      .expect(200));
  });

  after(function*() {
    yield ([Story.iDeleteById(NEW_STORY.id)]);
  })
});
