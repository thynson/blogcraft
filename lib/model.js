var mg = require('mongoose');

var PostSchema = new mg.Schema({
    title : { type :String, validate : /^.+$/},
    body : String, // Content of post
    source : String, // Markdown source of post
    createdDate : { type : Date, default : Date.now },
    modifiedDate : { type : Date, default : Date.now },
    comments : [{ type : mg.Schema.ObjectId, ref : CommentSchema }]
});

var CommentSchema = new mg.Schema({
    name : { type : String, validate : /^.+$/ },
    email : { type : String,
              // Email address is case insensitive
              validate : /^[-+%_.a-z0-9]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.?/i },
    body : String,
    source : String,
    createdDate : { type : Date, default : Date.now },
    modifiedDate : { type : Date, default : Date.now }
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

module.exports = {

    Post : mg.model('Post', PostSchema),
    Config : mg.model('Config', ConfigSchema),
    Comment : mg.model('Comment', CommentSchema),

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

