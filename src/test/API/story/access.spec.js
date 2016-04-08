import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';

let Story = app.models.Story;
let User = app.models.user;

const COLLECTION_URL = 'stories';
const STORY1 = STORIES.test1;

describe(`/${COLLECTION_URL}`, function () {
  updateTimeouts(this);

  describe('GET/HEAD', ()=> {
    it('Anonymous - allow access to the list', () => {
      return api.get(COLLECTION_URL)
        .expect(200)
        .expect((res) => {
          let stories = res.body;
          stories.length.should.least(2);
          let story = stories[0];
          should.not.exist(story.slugLowerCase);
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
  });

  describe('GET by slug', () => {
    it('Anonymous - allow access to any by slug', () => {
      return api.get(`${COLLECTION_URL}/slug/${encodeURIComponent(STORY1.slugLowerCase)}`)
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.id.should.eq(STORY1.id);
        })
    });

    it('Anonymous - wrong slug should return 404', () => {
      return api.get(`${COLLECTION_URL}/slug/wrong_slug`)
        .expect(404)
    });
  });

  describe('PUT/POST', () => {
    const NEW_STORY = {
      id: '1a4000000000000000010001',
      title: "New story for test",
      content: STORY1.content,
      //this userId should be ignored
      userId: '1a400000000000000001111'
    };

    it('Anonymous - deny to add', () => {
      return api.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(401)
    });

    it('User - allow to add', () => {
      let storiesNumberBefore;
      return User.findByIdRequired(user1.id)
        .then(user => storiesNumberBefore = user.storiesNumber)
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.post(COLLECTION_URL)
              .send(NEW_STORY)
              .expect(200)
              .expect((res) => {
                let story = res.body;
                user1.id.should.equal(story.userId);
                Story.STATUS.ACTIVE.should.equal(story.status);
              })
          })
        })
        .then(() => User.findByIdRequired(user1.id))
        .then(user => user.storiesNumber.should.eq(storiesNumberBefore + 1))
    })
    ;

    it('User - deny to foreign update', () => {
      return user2Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
          .send({})
          .expect(401)
      });
    });

    let newTitle = "NEW TITLE";
    let newId = '1a4000000000000000910001';
    let newContent = 'NEW CONTENT';
    newContent = Sanitize.fakerIncreaseAlphaLength(newContent, Story.MIN_CONTENT_LENGTH);

    it('User - deny to update id', () => {
      return user1Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
          .send({id: newId})
          .expect(400)
      });
    });

    it('User - allow to update', ()=> {
      return user1Promise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
          .send({
            title: newTitle,
            content: newContent,
            userId: user2.id
          })
          .expect(200)
          .expect((res) => {
            let story = res.body;
            user1.id.should.equal(story.userId);
            newTitle.should.equal(story.title);
            newContent.should.equal(story.content);
          })
      });
    });


    newTitle += 2;
    it('Admin - allow to update any', () => {
      return adminPromise.then(({agent}) => {
        return agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
          .send({
            title: newTitle,
            userId: user2.id
          })
          .expect(200)
          .expect((res) => {
            let story = res.body;
            user1.id.should.equal(story.userId);
            newTitle.should.equal(story.title);
            newContent.should.equal(story.content);
          })
      });
    });

    after(()=> Story.iDeleteById(NEW_STORY.id));
  });

  describe('DELETE', () => {
    it('Route should not exist', () => {
      return api.del(`${COLLECTION_URL}/${STORY1.id}`)
        .expect(404)
    });
  })
});
