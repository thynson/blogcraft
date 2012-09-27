var con = require('console');
var mg = require('mongoose');
var md = require('marked');
var hljs = require('highlight.js');
var xchain = require('xchain');
var model = require('../model');
var common = require('../common');

module.exports = function(app) {
    // TODO: TLS

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

    app.get(/^\/post\/([0-9a-f]+)$/, function(req, res, next) {
        var uuid = req.params[0];

        xchain(
            common.begin()
        )(
            function(x) {
                model.Post.findOne({ _id : uuid}, function(err, post) {
                    if (err) {
                        next({ status : 404 });
                    } else {
                        x.data.post = post;
                        x();
                    }
                });
            },
            common.navigationInfo()
        )(
            function(x) {
                res.render('post.jade', x.data);
            }
        ).run(
            function(err) {
                con.log('Exception in GET /post/' + uuid, err);
                next(err);
            }
        );
    });

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
                res.json(201, {});
            }
        });
    });
}
