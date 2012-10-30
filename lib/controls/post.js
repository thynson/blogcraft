var con = require('console');
var mg = require('mongoose');
var md = require('marked');
var hljs = require('highlight.js');
var model = require('../model');
var common = require('../common');
var crypto = require('crypto');

module.exports = function(app) {

    md.setOptions({
        gfm : true,
        sanitize : true,
        highlight : function(code, lang) {
            if (lang)
                return hljs.highlight(lang, code).value;
            else
                return code;
        }
    });

    var calcluateEmailHash = function(comments) {
        comments.forEach(function(x) {
            var md5sum = crypto.createHash('md5');
            md5sum.update(x.email);
            x.emailMD5 = md5sum.digest('hex');
        });
    }


    app.get(/^\/post\/([0-9a-f]+)$/,
        common.begin(),
        common.navigationInfo(),
        function(req, res, next) {
            var uuid = req.params[0];
            model.Post.findOne({ _id : uuid})
            .populate('comments')
            .exec(function(err, post) {
                if (err) {
                    next(new common.httpError(404, 'Request entity not found'));
                } else {
                    req.data.post = post;
                    calcluateEmailHash(post.comments);
                    res.render('post.jade', req.data);
                }
            });
        }
    );

    app.post('/post', function(req, res) {

        var post = new model.Post();

        post.title = req.body.title;
        post.body = md.parse(req.body.body);
        post.source = req.body.body;

        post.save(function(err) {
            if (err) {
                res.json(502, { error : err });
            } else {
                res.set({'Location' : '/post/' + post.id});
                res.status(201).end();
            }
        });
    });

    app.post(/^\/post\/([0-9a-f]+)\/comment$/, function(req, res, next) {
        var uuid = req.params[0];
        if (!req.body.name || !req.body.email || !req.body.body)
            next(new common.httpError(400, 'Request incomplete'));
        else {
            model.Post.findOne({ _id : uuid }, function(err, post) {
                if (err)
                    return next(new common.httpError(400,
                                'Cannot find post for comment'));
                comment = new model.Comment({
                    name : req.body.name,
                    email : req.body.email,
                    source : req.body.source,
                    body : md.parse(req.body.body)
                });

                comment.save(function(err) {
                    if (err) return next(err);
                    post.comments.push(comment);
                    post.save(function(err){
                        if (err) return next(err);
                        res.set({ 'Location' : '/post/' + post._id
                                             + '/comment/' + comment._id});
                        res.status(201).end();
                    });
                });
            });
        }
    });
}
