
var model = require('../model');
var con = require('console');

module.exports = function(app) {
	app.get('/ajax/post', function(req, res) {
		model.Post.find().exec(function(err, posts) {
			if (err) return next(err);
			else res.status(200).json(posts);
		});
	});
}
