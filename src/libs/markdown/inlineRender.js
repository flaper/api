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

renderer.link = (href, title, text) => {
  let t = text.replace('https://', '').replace('http://', '');
  return `<a href="${href}">${t}</a>`;
};

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
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/&quot;/g, '\"')
    .trim();
};

