delete require.cache[require.resolve('marked')];//to prevent get options for marked from another library
import marked from 'marked';
import {linkRender} from './link';

let renderer = new marked.Renderer();

renderer.heading = (text, level) => {
  return `<strong>${text}</strong>\n`;
};

renderer.image = (href, title, text) => {
  return '';
};

renderer.paragraph = (text) => {
  return '<br>' + text + '\n' + '<br>';
};

renderer.list = (body, ordered) => {
  return body + '\n';
};

renderer.listitem = (string) => {
  return ' ' + string;
};

renderer.link = linkRender;

renderer.hr = () => {
  return '\n';
};


marked.setOptions({
  renderer: renderer,
  breaks: false
});


export let inlineRender = (value) => {
  //we replace all triple new lines to max 2 lines
  return marked(value)
    .replace(/(<br>){2,}/g, '\n') //prevent paragraph collapsing
    .replace(/<br>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/&quot;/g, '\"')
    .trim();
};

