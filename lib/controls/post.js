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
    };

    var renderPagePipeline = [
        common.navigationInfo(),
        function(req, res, next) {
            res.render('post.jade', req.data);
        }
    ]

    app.get(/^\/post\/([0-9a-f]+)$/,
        common.begin(),
        function(req, res, next) {
            model.Post.findOne({ _id : req.params[0]})
            .populate('comments')
            .exec(function(err, post) {
                if (err) {
                    next(new common.httpError(404, 'Request entity not found'));
                } else {
                    req.data.post = post;
                    calcluateEmailHash(post.comments);
                    next();
                }
            });
        },
        renderPagePipeline
    );

    app.get(model.validate.customUrl,
        common.begin(),
        function(req, res, next) {
            con.log('Request custom url: ' + req.path);
            model.CustomUrl.findOne({ customUrl : req.path })
            .populate('post')
            .exec(function(err, pair) {
                if (err) {
                    next(err);
                } else if (pair == null) {
                    next(common.httpError(404, 'Request entitiy not found'));
                } else {
                    model.Post.populate(pair.post, 'comments', function(err, user) {
                        req.data.post = pair.post;
                        con.log(pair.post);
                        calcluateEmailHash(req.data.post.comments);
                        next();
                    });
                }
            });
        },
        renderPagePipeline
    );

    app.post('/post', function(req, res, next) {

        if (typeof req.body.body !== 'string'
            || typeof req.body.title !== 'string') {
            res.json(400, { error : 'Invalid request'});
        } else {

            if (typeof req.body.id === 'undefined') {
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
            } else {
                var id = req.body.id;
                req.body.source = req.body.body;
                req.body.body = md.parse(req.body.source);
                delete req.body.id;
                model.Post.findOneAndUpdate({ _id : id }, req.body, {})
                .exec(function(err) {
                    if (err) return next(err);
                    else res.status(200).end();
                });
            }
        }
    });

    app.post('/post/delete', function(req, res, next) {

        if (typeof req.body.id === 'undefined')
            return next(common.httpError(400, 'Invalid request'));

        model.Post.remove({ _id : req.body.id}, function (err){
            if (err) return next(err);
            else res.status(200).end();
        });
    });

    app.post(/^\/post\/([0-9a-f]+)\/comment$/, function(req, res, next) {
        var uuid = req.params[0];
        if (typeof req.body.name !== 'string'
            || typeof req.body.email !== 'string'
            || typeof req.body.body !=='string')
            next(new common.httpError(400, 'Invalid request'));
        else {
            model.Post.findOne({ _id : uuid }, function(err, post) {
                if (err)
                    return next(new common.httpError(400,
                                'Cannot find post for comment'));
                var website = req.body.website;

                // If protocol not provided, append // before it
                if (website.search(/^(https?:)?\/\//i) != 0)
                    website = '//' + website;

                comment = new model.Comment({
                    name : req.body.name,
                    email : req.body.email,
                    website : website,
                    source : req.body.source,
                    body : md.parse(req.body.body)
                });

                comment.save(function(err) {

                    if (err) {
                        if (err.name == 'ValidationError')
                            return next(common.httpError(400));
                        else
                            return next(err);
                    }

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
