const fs = require('fs');
const stringToJSON = require('../index');

const expected = fs.readFileSync('./expected.txt','UTF-8');

const files = [
	'./string-with-spaces.txt',
	// './string-with-tabs.txt',
	// './string-with-tabs-extra-newlines.txt',
];

files.forEach(function(filename){
	const content = fs.readFileSync(filename,'UTF-8');
	const result = stringToJSON(content);
	const stringified = JSON.stringify(result);
	if (stringified === expected) {
		console.log('OK', filename);
	} else {
		console.log('FAIL', filename);
	}
});
