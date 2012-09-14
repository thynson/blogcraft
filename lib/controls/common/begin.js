
var util = require('util');

module.exports = function(meta){
	if (typeof meta !== 'object' && !util.isArray(meta))
		meta = {};

	return function(x) {
		x.data = {};
		x.data.meta = meta;
		x.data.meta.renderStamp = Date.now();
		x();
	}
}
