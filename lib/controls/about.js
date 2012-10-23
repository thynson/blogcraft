var con = require('console');
var mg = require('mongoose');
var xchain = require('xchain');
var model = require('../model');
var common = require('../common');

module.exports = function(app) {
	app.get('/about', common.begin(), common.getConfig(),
            common.navigationInfo(),
        function(req, res, next) {
            req.data.about = req.data.config.about.body;
            res.render('about.jade', req.data);
        }
    );
}
