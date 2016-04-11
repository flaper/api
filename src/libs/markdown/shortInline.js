import {inlineRender} from './inlineRender'

const SYMBOLS_PER_LINE = 120;//estimation to consider one line length

export function shortInline(value, linesNumber = 4) {
  let inline = inlineRender(value);
  inline = inline.replace(/\n\s*\n/g, '\n');
  let length = SYMBOLS_PER_LINE * linesNumber;

  let res = '';
  try {
    res = cutInlineHtml(inline, length);
  }
  catch (e) {
    //never should happen
    console.log('shortInline exception', e);
  }

  //tag can be broken here, so currently commented out
  //let lines = res.split('\n').slice(0, linesNumber);//number of lines equal to linesNumber at max
  //return lines.join('\n');
  return res;
}


export function cutInlineHtml(html, limit) {
  let result = "";
  let len = html.length;
  let resultLength = 0;
  let i = 0;
  let totalIterations = 0;
  if (len > 0) {
    result = takeNext(0);
  }
  return result.trim();

  function isWhite(c) {
    return (c === ' ') || (c === '\t') || (c === '\n');
  }

  function isWhiteForWord(c) {
    return ' \t\n.,!'.indexOf(c) > -1;
  }

  //doesn't support tags with attributes, e.g. <a href="">something</a>
  function takeNext(depth) {
    let res = '';
    let j = i;
    while ((j < len - 1)) {
      //this is just additional counter to prevent internal loops if there is bug in the code
      if (totalIterations > len) {
        return res;
      }
      totalIterations++;
      //end of additional counter

      let cj = html[j];
      if (isWhiteForWord(cj)) {
        //space occurred
        let wordLength = j - i;
        if (wordLength > 0) {
          //so let's add word
          if (resultLength + wordLength <= limit) {
            res += html.substring(i, j);//html[j] not included
            resultLength += wordLength;
          } else {
            //so we reached limit
            return res;
          }
        }

        //let's add space
        if (resultLength + 1 <= limit) {
          res += cj;
          resultLength++;
        } else {
          //so we reached limit
          return res;
        }
        j++;
        i = j;
        //end of space occurred
      } else if (cj === '<') {
        //seems open or closed tag occurred
        //symbol < escaped currently as 5&lt; but can be changed in future

        let wordLength = j - i;
        if (wordLength > 0) {
          //so let's add word before tag
          if (resultLength + wordLength <= limit) {
            res += html.substring(i, j);//html[j] not included
            resultLength += wordLength;
          } else {
            //so we reached limit
            return res;
          }
        }

        let tag = parseTag(j);
        if (!tag.tag) {
          wordLength = tag.end - j;
          if (wordLength > 0) {
            //so let's this as just word
            if (resultLength + wordLength <= limit) {
              res += html.substring(j, tag.end);//html[tag.end] not included
              resultLength += wordLength;
            } else {
              //so we reached limit
              return res;
            }
          }

          j = tag.end;
          i = j;
        } else {
          i = tag.end;
          //so that is html tag!!
          let isClosingTag = (html[j + 1]) === '\/';
          if (isClosingTag) {
            //so it is closed tag
            return res;
          } else {
            //so it is open tag
            let tagName = tag.tag;
            //res += tag + takeNext(depth + 1) +tag;
            let content = takeNext(depth + 1);
            if (content) {
              switch (tagName) {
                case 'a':
                  res += `<${tagName} href="${tag.href}">${content}</${tagName}>`;
                  break;
                default:
                  res += `<${tagName}>${content}</${tagName}>`;
              }
            }
            j = i;
          }
        }
      }
      else {
        j++;
      }
    }

    if (i !== j) {
      //last word in the text, j === len - 1
      let wordLength = len - i;
      if (wordLength > 0) {
        //so let's add word
        if (resultLength + wordLength <= limit) {
          res += html.substring(i, len);//html[len] not included
          resultLength += wordLength;
        }
      }
    }
    return res;
  }

  //start eq to "<"
  function parseTag(start) {
    let foundSignMore = false;
    let y = start;

    let cY = null;
    while ((y < len - 1)) {
      y++;
      cY = html[y];
      if (cY >= 'a' && cY <= 'z' || cY === '\/') {
        //ok
      } else if (cY === ' ') {
        break;
      } else if (cY === '>') {
        foundSignMore = true;
        break;
      } else {
        return {
          tag: false,
          end: y //not including, that is actually new start
        };
      }
    }

    let tagName = html.substring(start + 1, y);
    if (foundSignMore) {
      return {
        tag: tagName,
        end: y + 1
      }
    }

    if (tagName !== 'a' || y === len - 1) {
      //we support attributes only for <a> tag
      return {
        tag: false,
        end: y + 1
      }
    }

    while ((y < len - 1)) {
      y++;
      cY = html[y];
      if ('<\n\t'.indexOf(cY) > -1) {
        return {
          tag: false,
          end: y //not including, that is actually new start
        };
      }
      if (cY === '>') {
        let hrefMatch = /<a [^>]*href="([^>"]+)"/;
        let matches = html.substring(start, y).match(hrefMatch);
        let href = matches ? matches[1] : '';
        return {
          tag: tagName,
          end: y + 1,
          href: href
        }
      }
    }

    return {
      tag: false,
      end: y
    }
  }

}

