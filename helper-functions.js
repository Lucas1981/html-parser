const escapeCharacter = '\\';
const stringMarker = '"';
const tagNameEnd = /\s|\n|\t|>|\/>/;

function isEscaped(string, start) {
  let index = start - 1;
  let isEscaped = false;
  while (index >= 0 && string.charAt(index) === escapeCharacter) {
    isEscaped = !isEscaped;
    index--;
  }
  return isEscaped;
}

function findEndOfString(content, start) {
  let index = start + 1;
  while (index < content.length) {
    const char = content.charAt(index);
    if (char === stringMarker && !isEscaped(content, index)) {
      return index;
    }
    index++;
  }
  throw new Error('String size exceded');
}

function extractTagName(content, start = 0) {
  let name = '';
  let index = start + 1;
  while (index < content.length && !content.charAt(index).match(tagNameEnd)) {
    name += content.charAt(index);
    index++;
  }
  return name;
}

module.exports = {
  isEscaped,
  findEndOfString,
  extractTagName
}
