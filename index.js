const keys = require('./keys.json');

function trim(str){
	return str.replace(/^[\s\t]+/,'').replace(/[\s\t]+$/,'');
}

function convertValue(val){
	const valueType = typeof val;
	if (valueType === 'number') {
		return val;
	}
	if (valueType === 'string') {
		if (val.match(/^[0-9]+$/)) {
			return parseInt(val, 10);
		}
		return val;
	}
	throw new Error('Unexptected value type');
}

/*
Handle both tab (normal) and space (sent using i.e. telegram) separated values
*/
module.exports = function stringToJSON (str) {
	const obj = {};
	const lines = str.split('\n');
	if (lines.length !== 2) {
		throw new Error('Expect the string to have two lines.');
	}
	let headerLine = trim(lines[0]);
	const valueLine = trim(lines[1]);
	const values = valueLine.split(/[\s\t]/);
	let keyIdx = 0;
	
	keys.forEach((key) => {
		const keyPosition = headerLine.indexOf(key);
		if (keyPosition > 0) {
			throw new Error(`Key "${key}" should be missing or at beginning. Maybe an unknown key was added?\n${headerLine}`);
		}
		if (keyPosition === 0) { // key is at start. best case. no values needed to skip
			obj[key] = convertValue(values[keyIdx++]);
		} else if (keyPosition === -1) { // key was not found. agent might be missing this stat
			obj[key] = 0;
		}
		headerLine = trim(headerLine.replace(key,''));
	});
	return obj;
};