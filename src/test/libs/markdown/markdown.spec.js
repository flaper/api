let should = require('chai').should();
import {TEST_IMAGE_ID, ImageService} from '../../../common/services/ImageService';
import {FlaperMark} from '../../../libs/markdown/markdown';

describe('/markdown', () => {
  it('external image', () => {
    //external means not an image created via Image model
    let html = FlaperMark.toHTML(`![](/external.jpg)`);
    html.trim().should.eq(`<p><img src="/external.jpg" alt=""></p>`);
  });

  it('local image', () => {
    let id = TEST_IMAGE_ID;
    let html = FlaperMark.toHTML(`![](${id})`);
    let bucket = ImageService.getBucketPath();
    html.trim().should.eq(`<p><img src="${bucket}${id}.jpg" alt=""></p>`);
  })
});
