var con = require('console');
var mg = require('mongoose');
var md = require('markdown');
var model = require('../model');

module.exports = function(app) {
	// TODO: TLS
	app.get('/post', function(req, res) {
        res.render('post.jade', {
            title : 'Hello world',
            body : 'Hello world!',
            markdown : md.markdown
        });
	});

	app.post('/post', function(req, res) {

        // TODO: Validate session
        var post = new model.Post();

        post.title = req.body.title;
        post.body = req.body.body;

        post.save(function(err) {
            if (err) {
                res.json(502, { error : err });
            } else {
                res.set({'Location' : '/post/' + post.id});
                res.json(201, {});
            }
        });
	});
}
