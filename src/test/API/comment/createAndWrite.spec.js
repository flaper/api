import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import {Sanitize} from '../../../../src/libs/sanitize/Sanitize';
import IMAGES from  '../../fixtures/image';
import _ from 'lodash';

let Comment = app.models.Comment;
let Story = app.models.Story;
let Image = app.models.Image;

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

  it('User - subjectId should be provided', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(_.omit(NEW_COMMENT, 'subjectId'))
      .expect(400));
  });

  it('User - subjectId should exist', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(_.assign({}, NEW_COMMENT, {subjectId: "wrongId"}))
      .expect(400));
  });

  it('User - allow to add for a story', function *() {
    let created = 0;
    let story = yield (Story.findByIdRequired(NEW_COMMENT.subjectId));
    let commentsNumber = story.commentsNumber;
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(NEW_COMMENT)
      .expect(200)
      .expect((res) => {
        let comment = res.body;
        user1.id.should.equal(comment.userId);
        NEW_COMMENT.subjectId.should.eq(comment.subjectId);
        'Story'.should.eq(comment.subjectType);
        comment.content.should.eq(NEW_COMMENT.content);
        comment.contentHTML.should.eq('test <strong>comment</strong>');
        Comment.STATUS.ACTIVE.should.equal(comment.status);
        created = new Date(comment.created);
      }));
    story = yield (Story.findByIdRequired(NEW_COMMENT.subjectId));
    story.commentsNumber.should.eq(commentsNumber + 1);
    story.lastActive.getTime().should.eq(created.getTime());
  });

  it('User - allow to add for an image', function*() {
    const IMAGE_COMMENT = {
      id: '1a5000000000000000010002',
      content: "test **comment**",
      subjectId: IMAGES.img1.id
    };

    let created = 0;
    let image = yield (Image.findByIdRequired(IMAGE_COMMENT.subjectId));
    let commentsNumber = image.commentsNumber;
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .send(IMAGE_COMMENT)
      .expect(200)
      .expect((res) => {
        let comment = res.body;
        user1.id.should.equal(comment.userId);
        IMAGE_COMMENT.subjectId.should.eq(comment.subjectId);
        'Image'.should.eq(comment.subjectType);
        comment.content.should.eq(NEW_COMMENT.content);
        comment.contentHTML.should.eq('test <strong>comment</strong>');
        Comment.STATUS.ACTIVE.should.equal(comment.status);
        created = new Date(comment.created);
      }));
    image = yield (Image.findByIdRequired(IMAGE_COMMENT.subjectId));
    image.commentsNumber.should.eq(commentsNumber + 1);
    image.lastActive.getTime().should.eq(created.getTime());
    yield (Comment.deleteById(IMAGE_COMMENT.id));
    yield (Comment.iSyncSubject('Image', IMAGE_COMMENT.subjectId));
  });

  it('User (strange) - deny update', function* () {
    let {agent} = yield (user2Promise);
    return yield (agent.put(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
      .send({})
      .expect(401));
  });

  it('User (owner) - allow update', function* () {
    let {agent} = yield (user1Promise);
    yield (agent.put(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
      .send({content: '*new text*'})
      .expect(200)
      .expect(res => {
        let comment = res.body;
        comment.contentHTML.should.eq('<em>new text</em>')
      }));
  });

  it('User - ignore id update', function* () {
    let NEW_ID = '1a5000000000000000010002';
    let {agent} = yield (user1Promise);
    yield (agent.put(`${COLLECTION_URL}/${NEW_COMMENT.id}`)
      .send({id: NEW_ID})
      .expect(400));
  });

  after(function *() {
    yield (Comment.deleteById(NEW_COMMENT.id));
    yield (Comment.iSyncSubject('Story', NEW_COMMENT.subjectId));
  });
});
