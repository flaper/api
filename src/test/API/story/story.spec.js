import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';
import {Sanitize} from '@flaper/markdown';
import _ from 'lodash';

let {Account, Image, Story} = app.models;
let User = app.models.user;

const COLLECTION_URL = 'stories';
const STORY1 = STORIES.test1;
const STORY_DENIED1 = STORIES.denied1;
const STORY_DELETED1 = STORIES.deleted1;

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
    it('Anonymous - allow access to any by slug', function*() {
      yield (api.get(`${COLLECTION_URL}/slug`)
        .query({slug: STORY1.slugLowerCase})
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.id.should.eq(STORY1.id);
          story.images.length.should.eq(1);
        }));
    });

    it('Anonymous - wrong slug should return 404', function*() {
      yield (api.get(`${COLLECTION_URL}/slug/wrong_slug`)
        .expect(404));
    });

    it('Active story should not accept id as slug', function*() {
      yield (api.get(`${COLLECTION_URL}/slug`)
        .query({slug: STORY1.id})
        .expect(404))
    });

    it('Denied story should accept id as slug', function*() {
      yield (api.get(`${COLLECTION_URL}/slug`)
        .query({slug: STORY_DENIED1.id})
        .expect(200)
        .expect((res) => {
          let story = res.body;
          story.id.should.eq(STORY_DENIED1.id);
        }));
    });

    it('Anonymous should not see delete story by id as slug', function*() {
      yield (api.get(`${COLLECTION_URL}/slug`)
        .query({slug: STORY_DELETED1.id})
        .expect(404));
    });

    it('Author story should see his deleted story by id as slug', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.get(`${COLLECTION_URL}/slug`)
        .query({slug: STORY_DELETED1.id})
        .expect(200));
    });

    it('Another user should not see deleted story by id as slug', function*() {
      let {agent} = yield (user2Promise);
      yield (agent.get(`${COLLECTION_URL}/slug`)
        .query({slug: STORY_DELETED1.id})
        .expect(404));
    });

    it('Admin user should see deleted story by id as slug', function*() {
      let {agent} = yield (adminPromise);
      yield (agent.get(`${COLLECTION_URL}/slug`)
        .query({slug: STORY_DELETED1.id})
        .expect(200));
    });
  });

  describe('PUT/POST', () => {
    const NEW_IMAGE = {
      "id": "1aa000000000000000010001",
      "status": "active",
      "type": "StoryCreate",
      "userId": "1a1000000000000000001001"
    };

    const NEW_IMAGE2 = {
      "id": "1aa000000000000000010002",
      "status": "active",
      "type": "StoryCreate",
      "userId": "1a1000000000000000001001"
    };

    let moneyBefore;

    before(function*() {
      moneyBefore = yield (Account.getAccountById(user1.id));
      yield (Image.create(NEW_IMAGE));
      yield (Image.create(NEW_IMAGE2));
    });

    const NEW_STORY = {
      id: '1a4000000000000000010041',
      type: 'article',
      title: "New story for test",
      content: STORY1.content.replace('image_holder', `![](${NEW_IMAGE.id})`),
      //this userId should be ignored
      userId: '1a400000000000000001111'
    };

    const WRONG_STORY = _.merge({}, NEW_STORY, {id: '1a4000000000000000010050', type: 'wrong'});

    it('Anonymous - deny to add', function*() {
      yield api.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(401);
    });

    it('User - error to create with wrong type', function*() {
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
        .send(WRONG_STORY)
        .expect(400);
    });

    it('User - allow to add', function*() {
      let oldUser = yield User.findByIdRequired(user1.id);
      let {agent} = yield user1Promise;
      yield agent.post(COLLECTION_URL)
        .send(NEW_STORY)
        .expect(200)
        .expect((res) => {
          let story = res.body;
          user1.id.should.equal(story.userId);
          Story.STATUS.ACTIVE.should.equal(story.status);
          story.images.length.should.eq(2);
          story.images[0].should.eq(`${NEW_IMAGE.id}`);
          should.not.exist(story.domains);
        });
      let user = yield User.findByIdRequired(user1.id);
      user.storiesNumber.should.eq(oldUser.storiesNumber + 1);
      let account = yield Account.getAccountById(user1.id);
      account.should.eq(moneyBefore + 1);
      let image = yield Image.findByIdRequired(NEW_IMAGE.id);
      image.type.should.eq('Story');
      image.objectId.toString().should.eq(NEW_STORY.id);
    });

    it('User - deny to foreign update', function*() {
      let {agent} = yield (user2Promise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
        .send({})
        .expect(401));
    });

    let newTitle = "NEW TITLE";
    let newId = '1a4000000000000000910001';
    let newContent = `NEW CONTENT ![](${NEW_IMAGE2.id})`;
    newContent = Sanitize.fakerIncreaseAlphaLength(newContent, Story.MIN_LENGTH.article);

    it('User - deny to update id', function* () {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
        .send({id: newId})
        .expect(400));
    });

    it('User - allow to update', function*() {
      let {agent} =  yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
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
          story.images.length.should.eq(1);
        }));
      let image = yield (Image.findByIdRequired(NEW_IMAGE2.id));
      image.type.should.eq('Story');
    });


    newTitle += 2;
    it('Admin - allow to update any', function*() {
      let {agent} = yield (adminPromise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_STORY.id}`)
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
        }));
    });

    after(function*() {
      yield ([Story.iDeleteById(NEW_STORY.id), Image.deleteById(NEW_IMAGE.id), Image.deleteById(NEW_IMAGE2.id)]);
    });
  });

  describe('DELETE', function*() {
    it('Route should not exist', function*() {
      yield (api.del(`${COLLECTION_URL}/${STORY1.id}`)
        .expect(404));
    });
  })
})
;
