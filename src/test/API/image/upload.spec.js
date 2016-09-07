import {api, user1Promise,user2Promise, user1} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();

let Image = app.models.Image;
const COLLECTION_URL = 'images';
const IMAGE_PATH = './src/test/media/sample_image.jpg';

describe(`/${COLLECTION_URL}/upload`, function () {
  updateTimeouts(this);

  it('Anonymous should be denied', () => {
    return api.post(COLLECTION_URL)
      .expect(401);
  });

  it('User - deny to upload without type', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .attach('file', IMAGE_PATH)
      .expect(400));
  });

  it('User - deny to upload with wrong type', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .field('type', 'wrong')
      .attach('file', IMAGE_PATH)
      .expect(400));
  });

  it('User - deny to upload without file', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .field('type', 'create-story')
      .expect(400));
  });

  it('User - allow to upload image', function*() {
    let {agent} = yield (user1Promise);
    yield (agent.post(COLLECTION_URL)
      .field('type', 'create-story')
      .attach('file', IMAGE_PATH)
      .expect(200));
    let image = yield (Image.findOne({
      where: {userId: user1.id},
      order: 'created DESC'
    }));
    should.exist(image);
    user1.id.should.eq(image.userId.toString());
  });
});
