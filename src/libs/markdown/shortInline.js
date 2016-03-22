import {inlineRender} from './inlineRender'
import striptags from 'striptags';

const SYMBOLS_PER_LINE = 120;//estimation to consider one line length

export function shortInline(value, linesNumber = 4) {
  let inline = inlineRender(value);
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

        //open tag occurred
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

        let y = j;
        let foundSignMore = false;
        while ((y < len - 1)) {
          y++;
          let cY = html[y];
          if (cY === '>') {
            foundSignMore = true;
            break;
          }
          if (isWhite(cY)) {
            break;
          }
        }

        if (!foundSignMore) {
          wordLength = y - j;
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

          //let's add space and '<' if that was last character
          if (resultLength + 1 <= limit) {
            res += html[y];
            resultLength++;
          }
          j = y + 1;
          i = j;
        } else {
          i = y + 1;
          //so that is html tag!!
          let isClosingTag = (html[j + 1]) === '\/';
          if (isClosingTag) {
            //so it is closed tag
            return res;
          } else {
            //so it is open tag
            let tag = html.substring(j, y + 1);
            //res += tag + takeNext(depth + 1) +tag;
            let content = takeNext(depth + 1);
            if (content) {
              res += tag + content + tag.replace(/^</, '</');
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
}

