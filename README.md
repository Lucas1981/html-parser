# Node based html parser

This is a very simple Node based html parser, creating it out of curiosity to see how such a thing might work.

## Use

The main thing to do is to import the `parseHtmlFromContent()` or `parseHtmlFromFile()` functions from the `parse-html.js` file, run whatever content or file you want through it and away you go. You can see a tree structure as a JSON representing the interpretation of the html file. It's tested on some very conservative and relatively happy scenarios, so I fear it is easily breakable right now.
