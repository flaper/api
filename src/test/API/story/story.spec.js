import {api, user1Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';

let Story = app.models.Story;

const COLLECTION_URL = 'stories';
const STORY1 = STORIES.test1;

describe(`/${COLLECTION_URL}/`, function () {
  updateTimeouts(this);

  describe('GET/HEAD', ()=> {
    it('Anonymous - allow access to the list', () => {
      return api.get(COLLECTION_URL)
        .expect(200)
        .expect((res) => {
          let stories = res.body;
          stories.length.should.least(2);
        })
    });

    it('Anonymous - allow access to any by id', () => {
      return api.get(`${COLLECTION_URL}/${STORY1.id}`)
        .expect(200)
    });

    it('Anonymous - allow check if exists by id', () => {
      return api.get(`${COLLECTION_URL}/${STORY1.id}/exists`)
        .expect(200);
    });

    it('Anonymous - allow HEAD', () => {
      return api.head(`${COLLECTION_URL}/${STORY1.id}`)
        .expect(200);
    });

    it('Anonymous - allow count', () => {
      return api.get(`${COLLECTION_URL}/count`)
        .expect(200);
    });

    it('Anonymous - deny findOne', () => {
      return api.get(`${COLLECTION_URL}/findOne`)
        .expect(200);
    });
  });

  describe('PUT/POST', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      title: "Just created",
      content: "Nice content"
    };

    it('Anonymous - deny to add', () => {
      return api.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(401)
    });

    it('User - allow to add', () => {
      return user1Promise.then(({agent}) => {
        return agent.post(COLLECTION_URL)
          .send(NEW_STORY)
          .expect(200)
      })
    });

    after(()=> Story.deleteById(NEW_STORY.id));
  })
});
