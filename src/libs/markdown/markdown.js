import {htmlRender} from './htmlRender'
import {inlineRender} from './inlineRender'
import {shortInline, cutInlineHtml} from './shortInline'

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
}
