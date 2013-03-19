var con = require('console');
var mg = require('mongoose');
var common = require('../common');

module.exports = function(app) {
	app.get('/admin',
		common.begin(),
		common.navigationInfo(),
		function(req, res) {
			res.render('admin.jade', req.data);
		}
	);
}
