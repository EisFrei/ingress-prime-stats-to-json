const fs = require('fs');
const stringToJSON = require('../index');

const input = './string-with-spaces.txt';
const output = './expected.txt';

const content = fs.readFileSync(input,'UTF-8');
const result = stringToJSON(content);
const stringified = JSON.stringify(result);

fs.writeFileSync(output, stringified);