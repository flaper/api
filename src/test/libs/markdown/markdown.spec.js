let should = require('chai').should();
import {TEST_IMAGE_ID, ImageService} from '../../../common/services/ImageService';
import {FlaperMark, MD_IMAGES_GROUP_CLASS} from '../../../libs/markdown/markdown';

const GROUP_CLASS = MD_IMAGES_GROUP_CLASS;

describe('/markdown', () => {
  it('external image', () => {
    //external means not an image created via Image model
    let html = FlaperMark.toHTML(`![](/external.jpg)`);
    html.trim().should.eq(`<p><div class="${GROUP_CLASS}"><div><img src="/external.jpg" alt=""></div></div></p>`);
  });

  it('local image', () => {
    let id = TEST_IMAGE_ID;
    let html = FlaperMark.toHTML(`![](${id})`);
    let bucket = ImageService.getBucketPath();
    html.trim().should.eq(`<p><div class="${GROUP_CLASS}"><div><img src="${bucket}${id}.jpg" alt=""></div></div></p>`);
  });

  it('group images', () => {
    let markdown = `![](${TEST_IMAGE_ID})`
    for (let i = 0; i < 7; i++) {
      markdown += ` ![](/external${i})`;
    }
    let result = `<p><div class="${GROUP_CLASS}"><div>` +
      '<img src="https://s3.eu-central-1.amazonaws.com/flaper.test.images/1abc0000fffffff.jpg" alt=""></div> ' +
      '<div><img src="/external0" alt=""></div> <div><img src="/external1" alt=""></div> ' +
      '<div><img src="/external2" alt="">' +
      `</div> </div><div class="${GROUP_CLASS}"><div><img src="/external3" alt=""></div> ` +
      '<div><img src="/external4" alt=""></div> ' +
      '<div><img src="/external5" alt=""></div> <div><img src="/external6" alt=""></div></div></p>';


    let html = FlaperMark.toHTML(markdown);
    html.trim().should.eq(result);
  })
});
