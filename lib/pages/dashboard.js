var crypto = require('crypto');
var con = require('console');
var model = require('../model');

module.exports = function(app) {
	// TODO: TLS
	app.get('/dashboard', function(req, res) {
		res.json(501, { error : 'Unimplemented'});
	});
}
