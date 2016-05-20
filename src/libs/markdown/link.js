import punycode from 'punycode';
import url from 'url';

function normalize(text) {
  let options = {stripFragment: false};
  let t = text.replace(/&amp;/g, '&');
  let parsed = url.parse(t);
  if (/^xn--/.test(parsed.hostname)) {
    parsed.host = punycode.toUnicode(parsed.host);
    t = url.format(parsed);
  }
  return decodeURI(t);
}


export function linkRender(href, title, text) {
  let t = text.trim();
  if (/^https?:\/\//i.test(t)) {
    t = normalize(t);
    t = t.replace(/https?:\/\//i, '');
  }
  let h = normalize(href);

  let isFlaper = /https?:\/\/flaper.org/i.test(h);
  let target = isFlaper ? '' : ' target="_blank"';
  return `<a href="${h}"${target}>${t}</a>`;
}
