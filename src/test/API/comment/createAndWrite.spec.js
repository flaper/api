import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';
import _ from 'lodash';

let Comment = app.models.Comment;
let Story = app.models.Story;

const COLLECTION_URL = 'comments';

describe.only(`/${COLLECTION_URL}/POST&PUT`, function () {
  updateTimeouts(this);

  const NEW_COMMENT = {
    id: '1a5000000000000000010001',
    content: "test comment",
    subjectId: "1a4000000000000000001001"
  };

  it('Anonymous - deny to add', () => {
    return api.post(COLLECTION_URL)
      .send(NEW_COMMENT)
      .expect(401)
  });

  it('User - subjectId should be provided', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(_.omit(NEW_COMMENT, 'subjectId'))
        .expect(400)
    })
  });

  it('User - subjectId should exist', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(_.assign({}, NEW_COMMENT, {subjectId: "wrongId"}))
        .expect(400)
    })
  });

  it('User - allow to add', () => {
    let created = 0;
    let commentsNumber = 0;
    Story.findByIdRequired(NEW_COMMENT.subjectId)
      .then(story => commentsNumber = story.commentsNumber)
      .then(() => {
        return user1Promise.then(({agent}) => {
          return agent.post(COLLECTION_URL)
            .send(NEW_COMMENT)
            .expect(200)
            .expect((res) => {
              let comment = res.body;
              user1.id.should.equal(comment.userId);
              NEW_COMMENT.subjectId.should.eq(comment.subjectId);
              'story'.should.eq(comment.subjectType);
              Comment.STATUS.ACTIVE.should.equal(comment.status);
              created = new Date(comment.created);
            })
        })
      })
      .then(() => Story.findByIdRequired(NEW_COMMENT.subjectId))
      .then(story => {
        story.commentsNumber.should.eq(commentsNumber + 1);
        story.lastActive.getTime().should.eq(created.getTime());
      })
  });

  it('User - update not exist', () => {
    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
        .send({})
        .expect(404)
    })
  });

  after(()=> Comment.deleteById(NEW_COMMENT.id));
});
