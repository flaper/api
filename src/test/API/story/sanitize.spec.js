import {user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';

let Story = app.models.Story;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@sanitize`, function () {
  updateTimeouts(this);
  const NEW_STORY = {
    id: '1a4000000000000000010001',
    title: "New story <em>for test",
    content: "Nice <b>content</b> for test"
  };


  it('Add - should be sanitized', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.title.should.eq('New story for test');
          story.content.should.eq('Nice content for test');
        })
    })
  });

  let title2 = '</div> ter </div>x<br>';
  let content2 = '//// <script>xs';
  it('Update - should be sanitized', () => {
    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
        .send({title: title2, content: content2})
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.title.should.eq(' ter x');
          story.content.should.eq('//// ');
        })
    })
  });

  after(()=> Story.deleteById(NEW_STORY.id));
});
