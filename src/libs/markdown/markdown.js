import marked from 'marked';
import {ImageService} from '../../common/services/ImageService';

//to remove auto ids for headers
let renderer = new marked.Renderer();
renderer.heading = function (text, level) {
  return `<h${level}>${text}</h${level}>`;
};

renderer.image = function (href, title, text) {
  let parentImageMethod = marked.Renderer.prototype.image.bind(this);
  let isLocalLink = /^[0-9a-f]+$/.test(href);
  href = isLocalLink ? ImageService.getImageUrlById(href) : href;
  return parentImageMethod(href, title, text);
};

marked.setOptions({renderer});

export class FlaperMark {
  static toHTML(value) {
    return marked(value);
  }
}
