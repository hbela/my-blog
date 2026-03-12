
const { marked } = require("marked");
const renderer = new marked.Renderer();
renderer.heading = function(token) {
  return `<h${token.depth}>${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
};
marked.use({ renderer });
console.log(marked.parse("## Hello **Bold**"));
