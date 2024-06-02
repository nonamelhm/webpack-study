const markdownIt = require('markdown-it')();

module.exports = function markdownLoader(source) {
    const html = markdownIt.render(source);
    return `module.exports = ${JSON.stringify(html)}`;
};
