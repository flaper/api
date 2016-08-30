import {htmlRender} from './htmlRender'
import {inlineRender} from './inlineRender'
import {shortInline, cutInlineHtml} from './shortInline'
import _ from 'lodash';

export class FlaperMark {
  static toHTML(value) {
    return htmlRender(value);
  }

  static toInline(value) {
    return inlineRender(value);
  }

  static shortInline(value) {
    return shortInline(value);
  }

  static getImages(value) {
    const regex = /\!\[\]\([0-9a-f]{24}\)/g;
    let images = value.match(regex);
    images = images || [];
    images = images.map(i => i.substring(4, 28));
    return _.uniq(images);
  }
}
