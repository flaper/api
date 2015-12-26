let should = require('chai').should();
import {TEST_IMAGE_ID, ImageService} from '../../../common/services/ImageService';
import {FlaperMark, MD_IMAGES_GROUP_CLASS} from '../../../libs/markdown/markdown';

const GROUP_CLASS = MD_IMAGES_GROUP_CLASS;

describe('/markdown', () => {
  let testId = TEST_IMAGE_ID;
  let testPath = ImageService.idToPath(testId) + '_middle.jpg';
  let testBucket = ImageService.getBucketPath();
  let testUrl = `${testBucket}${testPath}`;

  it('external image', () => {
    //external means not an image created via Image model
    let html = FlaperMark.toHTML(`![](/external.jpg)`);
    html.trim().should.eq(`<p><div class="${GROUP_CLASS}"><div><img src="/external.jpg" alt=""></div></div></p>`);
  });

  it('local image', () => {
    let html = FlaperMark.toHTML(`![](${testId})`);
    html.trim().should.eq(`<p><div class="${GROUP_CLASS}"><div><img src="${testUrl}" alt=""></div></div></p>`);
  });

  it('group images', () => {
    let markdown = `![](${testId})`
    for (let i = 0; i < 7; i++) {
      markdown += ` ![](/external${i})`;
    }
    let result = `<p><div class="${GROUP_CLASS}"><div>` +
      `<img src="${testUrl}" alt=""></div> ` +
      '<div><img src="/external0" alt=""></div> <div><img src="/external1" alt=""></div> ' +
      '<div><img src="/external2" alt=""></div> ' +
      `<div><img src="/external3" alt=""></div> ` +
      '<div><img src="/external4" alt=""></div> ' +
      '<div><img src="/external5" alt=""></div> <div><img src="/external6" alt=""></div></div></p>';


    let html = FlaperMark.toHTML(markdown);
    html.trim().should.eq(result);
  })
});
