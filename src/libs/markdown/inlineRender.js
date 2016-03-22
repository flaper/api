delete require.cache[require.resolve('marked')];//to prevent get options for marked from another library
import marked from 'marked';

let renderer = new marked.Renderer();

renderer.heading = (text, level) => {
  return `<strong>${text}</strong>\n`;
};

renderer.image = (href, title, text) => {
  return '';
};

renderer.paragraph = (text) => {
  return text + '\n';
};

renderer.list = (body, ordered) => {
  return body + '\n';
};

renderer.listitem = (string) => {
  return ' ' + string;
};

marked.setOptions({
  renderer: renderer,
  breaks: false
});


export let inlineRender = (value) => {
  return marked(value).trim();
};

