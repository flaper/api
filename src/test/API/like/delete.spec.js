import {api, user1Promise, user1, user2Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();

let Like = app.models.Like;
let Story = app.models.Story;
import STORIES from  '../../fixtures/story';
let STORY_WITHOUT_LIKES_USER3 = STORIES.withoutLikesUser3;

const COLLECTION_URL = 'likes';

describe(`/${COLLECTION_URL}/delete`, function () {
  updateTimeouts(this);
  it('Anonymous - no allow delete by id', () => {
    return api.del(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
      .expect(401)
  });

  it('User - deny delete if like not exist', function*() {
    let {agent} = yield user1Promise;
      return agent.del(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
        .expect(404)
  });

  describe("Sample like created", () => {
    const NEW_LIKE = {
      subjectId: STORY_WITHOUT_LIKES_USER3.id,
      subjectType: 'Story',
      subjectUserId: STORY_WITHOUT_LIKES_USER3.userId,
      userId: user1.id
    };
    before(() => Like.create(NEW_LIKE));

    it("User - deny delete foreign like", function*() {
      let {agent} = yield user2Promise;
        return agent.del(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
          .expect(404)
    });

    it("User - allow delete", function*() {
      let {agent} = yield user1Promise;
      yield agent.del(`${COLLECTION_URL}/${STORY_WITHOUT_LIKES_USER3.id}`)
        .expect(200)
        .expect(response => {
          let res = response.body;
          res.count.should.eq(0);
          res.status.should.eq(Like.RETURN_STATUS.DELETED);
        });
      let like = yield Like.findOne({where: NEW_LIKE});
      should.not.exist(like);
      let story = yield Story.findById(STORY_WITHOUT_LIKES_USER3.id);
      return story.likesNumber.should.eq(0);
    })
  })
});
