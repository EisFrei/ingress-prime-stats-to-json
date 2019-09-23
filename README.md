# ingress-prime-stats-to-json
> Takes the stats TSV string copied from Ingress Prime and converts it to JSON. Can handle tabs replaced by spaces, throws an exception if an unknown key is found.

## Installation

```
npm install ingress-prime-stats-to-json --save
```

## Usage

```javascript
var stringToJSON = require('ingress-prime-stats-to-json')
var result = stringToJSON('Time Span Agent Name Agent Faction .... 81426 148245 715 9 1 1');
```

## License

MIT
