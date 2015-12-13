import {api, user1Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';

let Story = app.models.Story;

const COLLECTION_URL = 'stories';
const STORY1 = STORIES.test;

describe(`/${COLLECTION_URL}/`, function () {
  updateTimeouts(this);

  const STORY_TO_ADD = {
    id: '1a4000000000000000010001',
    title: "Just created",
    content: "Nice content"
  };

  describe('GET/HEAD', ()=> {
    it('Anonymous - allow access to the list', () => {
      return api.get(COLLECTION_URL)
        .expect(200)
        .expect((res) => {
          let stories = res.body;
          stories.length.should.least(2);
        })
    });
  });
});
