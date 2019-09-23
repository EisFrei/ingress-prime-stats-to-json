const fs = require('fs');
const stringToJSON = require('../index');

const stringWithSpaces = fs.readFileSync('./string-with-spaces.txt','UTF-8');
const stringWithTabs = fs.readFileSync('./string-with-tabs.txt','UTF-8');

const resultSpaces = stringToJSON(stringWithSpaces);
const resultTabs = stringToJSON(stringWithTabs);
console.log(resultSpaces);
console.log(resultTabs);