import {user1, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';
import {Sanitize} from '@flaper/markdown';

let Story = app.models.Story;

const COLLECTION_URL = 'stories';
//can be out for API test folder
describe(`/${COLLECTION_URL}/@sanitize`, function () {
  updateTimeouts(this);
  const NEW_STORY = {
    id: '1a4000000000000000010001',
    type: 'article',
    title: "New story <em>for test",
    content: "Nice <b>content</b> for test"
  };

  it('Add - small content length should be an error', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(400)
    })
  });

  it('Add - should be sanitized', () => {
    NEW_STORY.content = Sanitize.fakerIncreaseAlphaLength(NEW_STORY.content, Story.MIN_LENGTH.article);
    let validContent = 'Nice content for test';
    validContent = Sanitize.fakerIncreaseAlphaLength(validContent, Story.MIN_LENGTH.article);

    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.title.should.eq('New story for test');
          story.content.should.eq(validContent);
        })
    })
  });

  it('Update - should be sanitized', () => {
    let title2 = '</div> ter </div>x<br>';
    let content2 = '//// dd<script>xs';
    let validContent2 = '//// dd';
    content2 = Sanitize.fakerIncreaseAlphaLength(content2, Story.MIN_LENGTH.article);
    validContent2 = Sanitize.fakerIncreaseAlphaLength(validContent2, Story.MIN_LENGTH.article);

    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
        .send({title: title2, content: content2})
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.title.should.eq('ter x');
          story.content.should.eq(validContent2);
        })
    })
  });

  after(()=> Story.iDeleteById(NEW_STORY.id));
});
