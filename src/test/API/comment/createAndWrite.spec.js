import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';
import _ from 'lodash';

let Comment = app.models.Comment;
let Story = app.models.Story;

const COLLECTION_URL = 'comments';

describe(`/${COLLECTION_URL}/POST&PUT`, function () {
  updateTimeouts(this);

  const NEW_COMMENT = {
    id: '1a5000000000000000010001',
    content: "test **comment**",
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

  it('User - subjectId should exist', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(_.assign({}, NEW_COMMENT, {subjectId: "wrongId"}))
      .expect(400));
  });

  it('User - allow to add', () => {
    let created = 0;
    let commentsNumber = 0;
    return Story.findByIdRequired(NEW_COMMENT.subjectId)
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
              comment.content.should.eq(NEW_COMMENT.content);
              comment.contentHTML.should.eq('test <strong>comment</strong>');
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

  it('User (strange) - deny update', () => {
    return user2Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
        .send({})
        .expect(401)
    })
  });

  it('User (owner) - allow update', () => {
    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
        .send({content: '*new text*'})
        .expect(200)
        .expect(res => {
          let comment = res.body;
          comment.contentHTML.should.eq('<em>new text</em>')
        })
    })
  });

  it('User - ignore id update', () => {
    let NEW_ID = '1a5000000000000000010002';
    return user1Promise.then(({agent}) => {
      return agent.put(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
        .send({id: NEW_ID})
        .expect(400)
    })
  });

  after(()=> {
    return Comment.deleteById(NEW_COMMENT.id)
      .then(() => Comment.iSyncSubject('Story', NEW_COMMENT.subjectId))
  });
});
