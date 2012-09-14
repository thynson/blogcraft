var con = require('console');
var mg = require('mongoose');
var xchain = require('xchain');
var model = require('../model');
var common = require('../common');

var calculatePageRange = function(meta) {
	// TODO Fix hardcoded magic number here
	meta.startPage = meta.page - 4;
	if (meta.startPage < 1)
		meta.startPage = 1;
	meta.endPage = meta.startPage + 8;
	if (meta.endPage > meta.maxPage)
		meta.endPage = meta.maxPage;
}

module.exports = function(app) {
	app.get('/', function(req, res, next) {

		if (req.query.page) {
			if (!req.query.page.match(/[1-9][0-9]*/))
				throw { status : 400 };
		} else
			req.query.page = '1';

		var page = Number(req.query.page);

		xchain(
			common.begin({ page : page }),
			common.getConfig()
		)(
			function(x) {
				model.Post.count(function(err, count) {
					if (err) {
						con.error ('model.Post.count failed');
						next({ status : 500 });
					}
					if ((page - 1) * x.config.pageMaxArtical >= count) {
						con.error ('Page out of range');
						next({ status : 404 });
					}
					x.data.meta.count = count;
					x.data.meta.maxPage = Math.ceil(count / x.config.pageMaxArtical);
					if (x.data.meta.maxPage == 0)
						x.data.meta.maxPage = 1;
					x();
				});
			},
			function(x) {
				model.Post.find().sort({createdDate : 'descending'})
				.skip((page - 1) * x.config.pageMaxArtical).limit(x.config.pageMaxArtical)
				.exec(function(err, posts) {
					if (err)
						next({ status : 404 });
					x.data.posts = posts;
					x();
				});
			},
			common.navigationInfo()
		)(
			function(x) {
				x.data.title = 'Nodian blog';
				calculatePageRange(x.data.meta);
				res.render('index.jade', x.data);
			}
		).run(
			function(err, x) {
				con.log('Exception in GET /: ', err);
				next(err);
			}
		)
	});
}

