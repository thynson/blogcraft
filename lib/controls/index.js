var con = require('console');
var mg = require('mongoose');
var model = require('../model');
var xchain = require('xchain');

module.exports = function(app) {
	app.get('/', function(req, res, next) {

		if (req.query.page) {
			if (!req.query.page.match(/[1-9][0-9]*/))
				throw { status : 400 };
		} else
			req.query.page = '1';

		var page = Number(req.query.page);

		xchain(function(x) {
			x.data = {};
			x();
		})(function(x) {
			model.Post.count(function(err, count) {
				if (err) {
					con.error ('model.Post.count failed');
					next({ status : 500 });
				}
				if ((page - 1) * 10 >= count && count != 0) {
					con.error ('Page out of range');
					next({ status : 404 });
				}
				x.data.count = count;
				x.data.maxPage = Math.ceil(count / 10);
				if (x.data.maxPage == 0)
					x.data.maxPage = 1;
				x();
			});
		}, function(x) {
			model.Post.find({}).sort('createDate')
			.skip((page - 1) * 10).limit(10)
			.exec(function(err, posts) {
				if (err)
					next({ status : 404 });
				x.data.posts = posts;
				x();
			});
		})(function(x) {
			x.data.title = 'Nodian blog';
			x.data.page = page;
			x.data.startPage = page - 4;
			if (x.data.startPage < 1)
				x.data.startPage = 1;
			x.data.endPage = x.data.startPage + 8;
			if (x.data.endPage > x.data.maxPage)
				x.data.endPage = x.data.maxPage;

			res.render('index.jade', x.data);
		}).run(function(err, x) {
			con.log('Exception in GET /: ', err);
			next(err);
		})
	});
}
