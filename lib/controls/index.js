var con = require('console');
var mg = require('mongoose');
var model = require('../model');

module.exports = function(app) {
	app.get('/', function(req, res) {
		model.Post.find({}).sort('createDate').limit(10).exec(function(err, posts) {
			if (err) {

			} else {
				res.render('index.jade', {
					title : 'Nodian blog',
					posts : posts
				});
			}
		});
	});
}
