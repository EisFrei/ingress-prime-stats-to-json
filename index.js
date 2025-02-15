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
			const reg = new RegExp(`^${translation}`);
			str = str.replace(reg, target);
		});
	});
	return str;
}

function hackyEncode(str) {
	keys.slice(0).sort((a, b) =>  b.length - a.length)
		.forEach((key, index) => str = str.replace(key, `-item-${index}-`));
	console.log('encoded', str);
	return str;
}

function hackyDecode(str) {
	keys.slice(0).sort((a, b) => b.length - a.length)
		.forEach((key, index) => str = str.replace(`-item-${index}-`, key));
	console.log('decoded', str);
		return str;
}

/*
Handle both tab (normal) and space (sent using i.e. telegram) separated values
*/
module.exports = function stringToJSON(str) {
	const obj = {};
	str = hackyEncode(str);
	const lines = trim(str).split('\n');
	if (lines.length !== 2) {
		throw new Error('Expect the string to have two lines.');
	}
	let headerLine = trim(lines[0]);
	const valueLine = tempTimeSpan(trim(lines[1]));
	const containsTab = str.indexOf("\t") !== -1;
	if (containsTab) {
		const headerElements = headerLine.split("\t");
		const valueElements = valueLine.split("\t");
		if (headerElements.length < requiredKeys.length) {
			throw new Error(`Not enough keys in header found – ${headerElements.length} < (${valueElements.length}`);
		}

		if (headerElements.length !== valueElements.length) {
			throw new Error(`Difference between header (${headerElements.length}) and value (${valueElements.length}) element counts`);
		}

		for (let i = 0; i < headerElements.length; i++) {
			obj[hackyDecode(headerElements[i])] = convertValue(valueElements[i]);
		}
	} else {
		const values = valueLine.split(/[\s\t]/).map(convertValue);
		let keyIdx = 0;

		keys.forEach((key) => {
			const encodedKey = hackyEncode(key);
			const keyPosition = headerLine.indexOf(encodedKey);
			if (keyPosition > 0) {
				throw new Error(`Key "${key}" "${encodedKey}" at position ${keyPosition} should be missing or at beginning. Maybe an unknown key was added?\n${headerLine}`);
			}
			if (keyPosition === 0) { // key is at start. best case. no values needed to skip
				obj[hackyDecode(key)] = values[keyIdx++];
			} else if (keyPosition === -1) { // key was not found. agent might be missing this stat
				obj[hackyDecode(key)] = 0;
			}
			headerLine = trim(headerLine.replace(encodedKey, ''));
		});
	}
	requiredKeys.forEach((key) => {
		if (!obj.hasOwnProperty(key)) {
			throw new Error(`Missing the required value ${key} – ${JSON.stringify(obj)}`);
		}
	});
	return obj;
};
