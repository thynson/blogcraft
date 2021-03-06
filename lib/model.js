var mg = require('mongoose');

var validate = {
    // Email address is case insensitive
    email : /^[-+%_.a-z0-9]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.?/i,
    url : /^(((https?:)?\/\/)?([-0-9a-z]+\.)*([a-z]+)(\/.*)?)?$/i,
    customUrl : /^\/[a-zA-Z0-9][-a-zA-Z0-9]{5,}$/
}

var CommentSchema = new mg.Schema({
    name : { type : String, validate : /^.+$/ },
    email : { type : String, validate : validate.email },
    website : { type : String, validate : validate.url },
    body : String,
    source : String,
    createdDate : { type : Date, default : Date.now },
    modifiedDate : { type : Date, default : Date.now }
});

var PostSchema = new mg.Schema({
    title : { type : String, validate : /^.+$/},
    body : String, // Content of post
    source : String, // Markdown source of post
    createdDate : { type : Date, default : Date.now },
    modifiedDate : { type : Date, default : Date.now },
    comments : [{ type : mg.Schema.ObjectId, ref : 'Comment' }]
});

var ConfigSchema = new mg.Schema({
    pageMaxArtical : { type : Number, default : 10},
    about : {
        body : { type : String, default : "" },
        source : { type : String, default : "" }
    },
    password : { type : String, default : "" },
    startupDate : { type : Date, default : Date.now }
});

var CustomUrlSchema = new mg.Schema({
    post : { type : mg.Schema.ObjectId, ref : 'Post' },
    customUrl : { type : String, validate : validate.customUrl}
});

module.exports = {

    Comment : mg.model('Comment', CommentSchema),
    Post : mg.model('Post', PostSchema),
    Config : mg.model('Config', ConfigSchema),
    CustomUrl : mg.model('CustomUrl', CustomUrlSchema),
    validate : validate,

    // @brief Initialize mongoose connection
    // @param dburi The uri of database
    // @param callback Will be called when database connected, which
    //        should receive an argument indicating error info if
    //        it's non-null.
    init : function(dburi, callback) {
        mg.connect(dburi, function(err) {
            if (err)
                callback(err);
            else
                module.exports.Config.findOneAndUpdate({
                    _id : new mg.Types.ObjectId()
                }, {}, {
                    upsert : true
                }, function(err) {
                    if (err)
                        callback(err);
                    else
                        callback();
                });
        });
    }
}

