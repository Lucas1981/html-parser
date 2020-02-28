const fs = require('fs').promises;
const analyseTag = require('./analyse-tag.js');
const {
  isEscaped,
  findEndOfString,
  extractTagName
} = require('./helper-functions.js');
const startTag = '<';
const endTag = '>';
const stringMarker = '"';
const closingTagCharacter = '/';
const commentTagStart = '!--';
const commentTagEnd = '-->';
const selfClosingTags = ['img', 'input', '!doctype']
const nodeTypes = {
  root: 'root',
  string: 'string',
  tag: 'tag',
  selfClosingTag: 'self-closing-tag',
  comment: 'comment'
}

function isSelfClosing(content, index, tagName) {
  if (selfClosingTags.includes(tagName.toLowerCase())) {
    return true;
  } else if (index > 0) {
    return content.charAt(index - 1) === closingTagCharacter;
  }
  throw new Error("Index tries to probe -1 on string")
}

function scanForMatchingTag(content, tagName, start) {
  let index = start + 1; // avoid the first tag being found
  let levels = 1;
  let isInString = false;
  while(index < content.length && levels > 0) {
    const char = content.charAt(index);

    if (char === stringMarker && !isEscaped(content, index)) {
      isInString = !isInString;
    }

    if (!isInString && char === startTag) {
      const foundTagName = extractTagName(content, index);
      if (foundTagName === tagName) {
        levels++;
      }
      if (foundTagName === `/${tagName}`) {
        levels--;
      }
    }
    index++;
  }
  return index;
}

function commitString(string, nodes) {
  // First, commit the string if we were looking for one
  const cleanString = string.replace(/\n|\t/g, '').trim();
  if(cleanString.length) { // Only do this is if there is a string
    nodes.push({
      type: nodeTypes.string,
      value: cleanString
    });
  }
}

function commitSelfClosingTag(content, index, nodes, endOfTag) {
  nodes.push({
    type: nodeTypes.selfClosingTag,
    ...analyseTag(content, index, endOfTag)
  });
}

function commitTag(content, index, nodes, endOfTag, closingTagIndex) {
  const length = closingTagIndex - (endOfTag + 1);
  nodes.push({
    type: nodeTypes.tag,
    ...analyseTag(content, index, endOfTag),
    children: length ? parseHtml(content.substring(endOfTag + 1, closingTagIndex - 1)) : null
  });
}

function findEndOfTag(content, start) {
  let index = start;
  while (index < content.length) {
    const char = content.charAt(index);
    switch (char) {
      case endTag:
        return index;
      case stringMarker:
        index = findEndOfString(content, index);
        break;
    }
    index++;
  }
}

function isCommentTag(content, index) {
  const tag = extractTagName(content, index);
  return tag === commentTagStart;
}

function commitCommentTag(content, index, nodes, end) {
  // Extract the entire comment and commit it
  const comment = content.substring(index, end);
  nodes.push({
    type: nodeTypes.comment,
    value: comment
  });
}

function parseHtml(content) {
  let index = 0;
  let string = '';
  let nodes = [];

  while (index < content.length) {
    const char = content.charAt(index);
    switch (char) {
      case startTag:
        commitString(string, nodes);
        string = '';

        const tag = extractTagName(content, index);
        const endOfTag = findEndOfTag(content, index);

        // Special case: This is a commented string
        if (isCommentTag(content, index)) {
          const commentEndIndex = index + content.substring(index).indexOf(commentTagEnd);
          const commentTagEndLength = commentTagEnd.length;
          commitCommentTag(content, index, nodes, commentEndIndex + commentTagEndLength);
          // Fast forward to the end of the comment and move on
          index = commentEndIndex + commentTagEndLength - 1;
        // This might be a self-closing tag, so then we're done with this one
        } else if (isSelfClosing(content, endOfTag, tag)) {
          commitSelfClosingTag(content, index, nodes, endOfTag);
          index = endOfTag;
        // Otherwise, seek the closing tag and process everyting inside
        } else {
          const closingTag = `</${tag}>`;
          const closingTagIndex = scanForMatchingTag(content, tag, index);
          commitTag(content, index, nodes, endOfTag, closingTagIndex);

          // Fast forward to the end of the closing tag and move on
          index = closingTagIndex + closingTag.length - 1;
        }
        break;
      default:
        string += char;
    }
    // Keep things moving
    index++;
  }
  // Commit the final string we have, if we have it
  commitString(string, nodes);

  return nodes;
}

function parseHtmlFromContent(content) {
  return {
    type: nodeTypes.root,
    children: parseHtml(content),
    source: content
  };
}

async function parseHtmlFromFile(file) {
  const content = await fs.readFile(file, 'utf8');
  return parseHtmlFromContent(content);
}

module.exports = {
  findEndOfTag,
  scanForMatchingTag,
  parseHtml,
  parseHtmlFromContent,
  parseHtmlFromFile
};
