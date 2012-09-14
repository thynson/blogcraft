var con = require('console');
var mg = require('mongoose');
var xchain = require('xchain');
var model = require('../model');
var common = require('../common');

module.exports = function(app) {
	app.get('/about', function(req, res, next) {
		xchain(
			common.begin(),
			common.getConfig()
		)(
			common.navigationInfo()
		)(
			function(x) {
				x.data.post = {
					title : "About",
					body : x.config.about.body,
					createdDate : x.config.startupDate,
					modifiedDate : x.config.startupDate
				};
				res.render('post.jade', x.data);
			}
		).run(function(err) {
			con.log('Exception in GET /about: ', err);
			next(err);
        })

	});
}
