import {user1, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';
import _ from 'lodash';

let Story = app.models.Story;

const COLLECTION_URL = 'stories';
const STORY1 = STORIES.test1;

describe(`/${COLLECTION_URL}/@tags`, function () {
  updateTimeouts(this);

  const NEW_STORY = {
    id: '1a4000000000000000010001',
    content: STORY1.content,
    title: STORY1.title,
    tags: ["tag1", "tag2", "tag3"]
  };


  it('Deny - save string instead of array', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(_.assign({}, NEW_STORY, {tags: 'string'}))
        .expect(400);
    })
  });

  it('Limit/filter - limit tags number, filter values', () => {
    let tooManyTags = _.map((new Array(Story.MAX_TAGS + 1)), (item, i) => '   -ТЕСТ новый/sdf' + i);
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(_.assign({}, NEW_STORY, {tags: tooManyTags}))
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.tags.length.should.eq(Story.MAX_TAGS);
          story.tags[0].should.eq('тестновыйsdf0');
        })
    })
  });

  it('Update - skip empty tags', ()=> {
    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
        .send({tags: ['', '  --//', ' н о р м']})
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.tags.length.should.eq(1);
          story.tags[0].should.eq('норм');
        })
    })
  });

  after(()=> Story.iDeleteById(NEW_STORY.id));
});
