import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../../server/server';
let should = require('chai').should();

let Image = app.models.Comment;
const COLLECTION_URL = 'images';
const IMAGE_PATH = './src/test/media/sample_image.jpg';

describe(`/${COLLECTION_URL}/create`, function () {
  updateTimeouts(this);

  it('Anonymous should be denied', () => {
    return api.post(COLLECTION_URL)
      .expect(401);
  });

  it('User - deny to upload without type', () => {
    return user1Promise.then(({agent})=> {
      return agent.post(COLLECTION_URL)
        .attach('file', IMAGE_PATH)
        .expect(400);
    })
  });

  it('User - deny to upload with wrong type', () => {
    return user1Promise.then(({agent})=> {
      return agent.post(COLLECTION_URL)
        .field('type', 'wrong')
        .attach('file', IMAGE_PATH)
        .expect(400);
    })
  });

  it('User - deny to upload without file', () => {
    return user1Promise.then(({agent})=> {
      return agent.post(COLLECTION_URL)
        .field('type', 'create-story')
        .expect(400);
    })
  });

  it('User - allow to upload image', () => {
    return user1Promise.then(({agent})=> {
        return agent.post(COLLECTION_URL)
          .field('type', 'create-story')
          .attach('file', IMAGE_PATH)
          .expect(200);
      })
      .then(() => Image.findOne({
        where: {userId: user1.id},
        order: 'created DESC'
      }))
      .then((image) => {
        should.exist(image);
        user1.id.should.eq(image.userId.toString());
      });
  });
});
