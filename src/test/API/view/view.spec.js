import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';
const STORY1 = STORIES.test1;

let Story = app.models.Story;
const COLLECTION_URL = 'views';

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('Adding 2 views', () => {
    let viewsRecent = 0;
    before(function*() {
      let story = yield Story.findByIdRequired(STORY1.id);
      viewsRecent = story.viewsRecent ? story.viewsRecent : 0;
    });

    it('Anonymous should be able to register a view', () => {
      return api.post(COLLECTION_URL)
        .send({id: STORY1.id})
        .expect(200)
    });

    it('User should be able to register a view', function*() {
      let {agent} = yield user1Promise;
        return agent.post(COLLECTION_URL)
          .send({id: STORY1.id})
          .expect(200)
    });

    after(function*() {
      let story = yield Story.findByIdRequired(STORY1.id);
      return story.viewsRecent.should.eq(viewsRecent + 2);
    })
  })
});
