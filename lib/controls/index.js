var con = require('console');
var mg = require('mongoose');
var xchain = require('xchain');
var model = require('../model');
var common = require('../common');

module.exports = function(app) {
	app.get('/',
		function(req, res, next) {
			// validate query argument
			if (req.query.page) {
				if (!req.query.page.match(/[1-9][0-9]*/))
					throw new common.HttpError(400, "Query argument invalid");
			} else
				req.query.page = '1';

			common.begin({ page : req.query.page })(req, res, next);
		},
		common.getConfig(),
		function(req, res, next) {
			model.Post.count(function(err, count) {
				if (err) {
					next(new common.HttpError(500,
							"Failed to query model.Post.count"));
				} else {
					if (req.data.checkPage(count, next)) {
						req.data.calculatePageRange(count)
						next();
					}
				}
			});
		},
		function(req, res, next) {
			model.Post.find()
			.sort({createdDate : 'descending'})
			.skip((req.query.page - 1) * req.data.config.pageMaxArtical)
			.limit(req.data.config.pageMaxArtical)
			.exec(function(err, posts) {
				if (err)
					next(new common.HttpError(404, "Query page not exists"));
				req.data.posts = posts;
				next();
			});
		},
		common.navigationInfo(),
		function(req, res) {
			req.data.title = 'Nodian blog';
			res.render('index.jade', req.data);
		}
	);
}

