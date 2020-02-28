const { isEscaped, extractTagName } = require('./helper-functions.js');

function findEndOfQuote(string, start) {
  let index = start;
  let marker = '';
  while (index < string.length) {
    const char = string.charAt(index);
    if (char.match(/'|"/)) {
      marker = char;
      break;
    }
    index++;
  }

  // Move to the next character to continue the inspection
  index++;


  while (index < string.length) {
    const char = string.charAt(index);
    if (char === marker && !isEscaped(string, index)) {
      break;
    }
    index++;
  }

  return index;
}

function findEnd(string, start) {
  let index = start;
  while (index < string.length) {
    const char = string.charAt(index);
    if (char.match(/( |>|\/>)/)) {
      break;
    }
    index++;
  }
}

function attributeHasValue(string, start) {
  const end = findEnd(string, start);
  const attribute = string.substring(start, end);
  return attribute.includes('=');
}

function analyseTag(content, start, end) {
  const name = extractTagName(content.substring(start, end)).replace('/', '');
  const attributes = [];
  const tag = content
    // Make sure the end of the tag is stripped properly if it's self-closing
    .substring(start, end - (content.charAt(end - 1) === '/' ? 1 : 0) )
    .trim();

  const stringOfAttributes = tag.replace(`<${name}`, '')
    // Get out all the newlines, tabs and form feeds
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\f/g, ' ');

  let index = 0;
  while (index < stringOfAttributes.length) {
    const char = stringOfAttributes.charAt(index);
    if (char !== ' ') {
      if (attributeHasValue(stringOfAttributes, index)) {
        const end = findEndOfQuote(stringOfAttributes, index);
        const attribute = stringOfAttributes.substring(index, end);
        let parts = attribute.split('=');
        const key = parts.shift();
        const value = parts.join('=');
        attributes.push({ key, value: value.substr(1) });
        index = end;
      } else {
        const end = findEnd(stringOfAttributes, index);
        const key = stringOfAttributes.substring(index, end);
        attributes.push({ key, value: null });
        index = end;
      }
    }
    index++;
  }

  return {
    name,
    attributes
  };
}

module.exports = analyseTag;
