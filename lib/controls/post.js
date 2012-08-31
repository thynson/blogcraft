var con = require('console');
var mg = require('mongoose');
var md = require('marked');
var hljs = require('highlight.js');
var model = require('../model');

module.exports = function(app) {
    // TODO: TLS

    md.setOptions({
        gfm : true,
        highlight : function(code, lang) {
            return hljs.highlight(lang, code).value;
        }
    });

    app.get(/^\/post\/([0-9a-f]+)$/, function(req, res) {
        var uuid = req.params[0];
        var post = model.Post.findOne({ _id : uuid}, function(err, post) {
            if (err) {
                res.status(404).render('404.jade');
            } else {
                res.render('post.jade', {
                    title : post.title,
                    body : post.body,
                    marked : md
                });
            }
        });
    });

    app.post('/post', function(req, res) {

        // TODO: Validate session
        var post = new model.Post();

        post.title = req.body.title;
        post.body = md.parse(req.body.body);
        post.source = req.body.body;

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
