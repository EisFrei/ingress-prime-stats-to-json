const keys = require('./keys.json');
const requiredKeys = require('./required-keys.json');
const timespanTranslations = require('./timespan-translations.json');

function trim(str) {
	return str.replace(/^[\s\t\n]+/gm, '').replace(/[\s\t\n]+$/gm, '');
}

function convertValue(val) {
	const valueType = typeof val;
	if (valueType === 'number') {
		return val;
	}
	if (valueType === 'string') {
		if (val.match(/^[0-9]+$/)) {
			return parseInt(val, 10);
		}
		return val.replace('_', ' '); // return tempTimeSpan to old value
	}
	throw new Error('Unexptected value type');
}

function tempTimeSpan(str) {
	const targets = Object.keys(timespanTranslations);
	targets.forEach(function (target) {
		timespanTranslations[target].forEach(function (translation) {
			str = str.replace(translation, target);
		});
	});
	return str;
}

/*
Handle both tab (normal) and space (sent using i.e. telegram) separated values
*/
module.exports = function stringToJSON(str) {
	const obj = {};
	const lines = trim(str).split('\n');
	if (lines.length !== 2) {
		throw new Error('Expect the string to have two lines.');
	}
	let headerLine = trim(lines[0]);
	const valueLine = tempTimeSpan(trim(lines[1]));
	const values = valueLine.split(/[\s\t]/).map(convertValue);
	let keyIdx = 0;

	keys.forEach((key) => {
		const keyPosition = headerLine.indexOf(key);
		if (keyPosition > 0) {
			throw new Error(`Key "${key}" at position ${keyPosition} should be missing or at beginning. Maybe an unknown key was added?\n${headerLine}`);
		}
		if (keyPosition === 0) { // key is at start. best case. no values needed to skip
			obj[key] = values[keyIdx++];
		} else if (keyPosition === -1) { // key was not found. agent might be missing this stat
			obj[key] = 0;
		}
		headerLine = trim(headerLine.replace(key, ''));
	});
	requiredKeys.forEach((key) => {
		if (!obj.hasOwnProperty(key)) {
			throw new Error('Missing the required value ' + key);
		}
	});
	return obj;
};