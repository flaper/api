import {updateTimeouts} from '../../../helpers/init';
import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import app from '../../../helpers/app';
import STORIES from  '../../../fixtures/story';
import FOBJECTS from  '../../../fixtures/fObject';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import _ from 'lodash';

const OBJ1 = FOBJECTS.obj1;
const PLACE1 = FOBJECTS.place1;
const REVIEW1 = STORIES.review1;
const REVIEW2 = STORIES.review2;
let User = app.models.user;
let Story = app.models.Story;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@reviews/update`, function () {
  updateTimeouts(this);

  describe('POST', () => {
    const NEW_REVIEW = {
      id: '1a4000000000000000010001',
      type: 'review',
      title: "New story for test",
      content: Sanitize.fakerIncreaseAlphaLength("test review", 256),
      rating: 8,
      objectId: OBJ1.id,
      // this userId should be ignored
      userId: '1a400000000000000001111'
    };
    
    const NEW_REVIEW2 = _.merge({}, NEW_REVIEW, {id: '1a4000000000000000010002', objectId: PLACE1.id});
    const NEW_STORY = _.merge({}, NEW_REVIEW, {id: '1a4000000000000000010003', type: 'article', 
      content: Sanitize.fakerIncreaseAlphaLength("test story", 1000)});

    it('User - deny to add to short review', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.post(COLLECTION_URL)
        .send(_.assign({}, NEW_REVIEW, {content: 'too short'}))
        .expect(400));
    });

    it('User - deny to add without rating', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.post(COLLECTION_URL)
        .send(_.omit(NEW_REVIEW, 'rating'))
        .expect(400));
    });

    it('User - deny to add without objectId', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.post(COLLECTION_URL)
        .send(_.omit(NEW_REVIEW, 'objectId'))
        .expect(400));
    });

    it('User - deny to add with wrong objectId', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.post(COLLECTION_URL)
        .send(_.assign({}, NEW_REVIEW, {objectId: '111'}))
        .expect(400));
    });

    it('User - allow to add', function*() {
      let userOld = yield (User.findByIdRequired(user1.id));
      let {agent} = yield (user1Promise);
      yield (agent.post(COLLECTION_URL)
        .send(NEW_REVIEW)
        .expect(200)
        .expect((res) => {
          let story = res.body;
          user1.id.should.equal(story.userId);
          Story.STATUS.ACTIVE.should.equal(story.status);
        }));
      let user = yield (User.findByIdRequired(user1.id));
      user.storiesNumber.should.eq(userOld.storiesNumber + 1);
    });

    it('User - review for different object with same title and new story should have same slug', function*() {
      let review1 = yield (Story.findByIdRequired(NEW_REVIEW.id));
      let review2 = yield (Story.create(NEW_REVIEW2));
      let story = yield (Story.create(NEW_STORY));
      review1.slug.should.eq(review2.slug);
      story.slug.should.eq(review1.slug);
    });

    it('User - deny to update to with short string', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_REVIEW.id}`)
        .send({content: 'too short'})
        .expect(400));
    });

    after(function*() { 
      let ids = [NEW_REVIEW.id, NEW_REVIEW2.id, NEW_STORY.id];
      yield (ids.map(id=>Story.iDeleteById(id)));
    });
  });

  describe('PUT', ()=> {
    it('User - deny to update foreign review', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${REVIEW2.id}`)
        .send({rating: 1})
        .expect(401));
    });

    it('User - allow to update rating for review', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${REVIEW1.id}`)
          .send({rating: 1})
          .expect(200)
          .expect(res => {
            let story = res.body;
            story.rating.should.eq(1);
          })
      );
      let review = yield (Story.findById(REVIEW1.id));
      yield (review.updateAttributes({rating: REVIEW1.rating}));
      review = yield (Story.findById(REVIEW1.id));
      review.rating.should.eq(REVIEW1.rating)
    });

    it('User - deny to update with wrong rating', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${REVIEW1.id}`)
        .send({rating: 12})
        .expect(400) );
    });

    it('User - deny to change objectId', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${REVIEW1.id}`)
        .send({objectId: FOBJECTS.obj3})
        .expect(400) );
    })
  });
});
