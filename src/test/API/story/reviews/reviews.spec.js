import {updateTimeouts} from '../../../helpers/init';
import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import app from '../../../helpers/app';
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';
import _ from 'lodash';

let Story = app.models.Story;
let User = app.models.user;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@reviews`, function () {
  updateTimeouts(this);

  describe('PUT/POST', () => {
    const NEW_REVIEW = {
      id: '1a4000000000000000010001',
      type: 'review',
      title: "New story for test",
      content: Sanitize.fakerIncreaseAlphaLength("test review", 256),
      rating: 8,
      objectId: '1a7000000000000000001001',
      //this userId should be ignored
      userId: '1a400000000000000001111'
    };

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

    it('User - deny to update to with short string', function*() {
      let {agent} = yield (user1Promise);
      yield (agent.put(`${COLLECTION_URL}/${NEW_REVIEW.id}`)
        .send({content: 'too short'})
        .expect(400));
    });

    after(()=> Story.iDeleteById(NEW_REVIEW.id));
  });
});
