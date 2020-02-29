const fs = require('fs').promises;
const { isEscaped, extractTagName } = require('./helper-functions.js');
const analyseTag = require('./analyse-tag.js');
const { reconstructFromContent } = require('./reconstruct-html.js');
const {
  scanForMatchingTag,
  parseHtmlFromFile
} = require('./parse-html.js');

(async function main() {
  console.log('Test 1: isEscaped should return if a character is escaped or not');
  const escaped = (await fs.readFile('./escaped.txt', 'utf8')).split('\n');
  for(const escape of escaped) {
    console.log(isEscaped(escape, escape.length - 1));
  }

  console.log('\nTest 2: extractTagName should return the proper tag name of a tag');
  const tag = '<p class="some-class" id="my-id" data-with-space="A string with spacing and    tabs" data-tricky="string with escaped \\"" data-attribute-without-value>';
  console.log(extractTagName(tag)); // Should return 'p';

  console.log('\nTest 3: analysis of a tag should return the proper parsing');
  console.log(analyseTag(tag, 0, tag.length));

  console.log('\nTest 4: analysis of an empty tag should be properly handled');
  console.log(analyseTag('<html>', 0, '<html>'.length - 1));

  console.log('\nTest 5: analysis of tag with valueless attribute tag should be properly handled');
  console.log(analyseTag('<!doctype html>', 0, '<!doctype html>'.length - 1));

  console.log('\nTest 6: see if scanForMatchingTag finds the proper matching tag');
  const scanString = '<p x="</p>">a<p>b</p><p>c<p>d</p></p>e</p>f'; // Should return 39.
  for (let i = 0; i < scanString.length; i++) console.log(`${i + 1}: ${scanString[i]}`);
  console.log(scanForMatchingTag(scanString, 'p', 0))

  console.log('\nTest 7: Parse an entire document');
  const result = await parseHtmlFromFile('./index.html');
  console.log(JSON.stringify(result,null,2));

  console.log('\nTest 8: Reconstruct the html');
  const reconstruction = reconstructFromContent(result);
  console.log(reconstruction);
  await fs.writeFile('./reconstruction.html', reconstruction, 'utf8');
})();
