import marked from 'marked';
import {ImageService} from '../../common/services/ImageService';

//to remove auto ids for headers
let renderer = new marked.Renderer();

export const MD_IMAGES_GROUP_CLASS="md-images-group";

renderer.heading = function (text, level) {
  return `<h${level}>${text}</h${level}>`;
};

renderer.image = function (href, title, text) {
  let parentImageMethod = marked.Renderer.prototype.image.bind(this);
  let isLocalLink = /^[0-9a-f]+$/.test(href);
  href = isLocalLink ? ImageService.getImageUrlById(href) : href;
  return parentImageMethod(href, title, text);
};

marked.setOptions({
  renderer: renderer,
  breaks: true
});

//images group should be in separate paragraph
function imagesToSeparateBlock(markdown) {
  //select groups of ![title](src)
  let imgGroupRegex = /((?:!\[[^\[\]]*]\([^\(\)]*\)\s*)+)/g;
  //let result = markdown.match(imgGroupRegex);
  return markdown.replace(imgGroupRegex, '\n\n$1\n\n');
}
function responsiveImages(html) {
  //future notes, we can remove <p></p> wrapper from images in future
  /**
   * capture group from 1 to 4 images
   *  ?: means not-capturing group
   * @type {RegExp}
   */
  let imgGroupRegex = /((?:<img [^>]+"> *(?:<br>)? *){1,4})/g;

  //Right now we have to place each image inside a block element due to a
  //Firefox quirk with scaling flexbox images; hopefully this will be fixed soon.
  let imgRegex = /(<img [^>]+">)/g;
  //let result = html.match(imgGroupRegex);
  html = html.replace(imgGroupRegex, `<div class="${MD_IMAGES_GROUP_CLASS}">$1</div>`)
    .replace(imgRegex, '<div>$1</div>');

  return html;
}

export class FlaperMark {
  static toHTML(value) {
    return responsiveImages(marked(imagesToSeparateBlock(value)));
  }
}
