var mg = require('mongoose');

var PostSchema = new mg.Schema({
    title : { type :String, validate : /^.+$/},
    body : String, // Content of post
    source : String, // Markdown source of post
    createdDate : { type : Date, default : Date.now },
    modifiedDate : { type : Date, default : Date.now },
    comments : [{ type : mg.Schema.ObjectId, ref : CommentSchema }]
});

var UserSchema = new mg.Schema({
    nickname : { type : String, validate : /^.+$/ },
    email : { type : String,
              // Email address is case insensitive
              validate : /^[-+%_.a-z0-9]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.?/i },
});

var CommentSchema = new mg.Schema({
    user : { type : mg.Schema.ObjectId, ref : UserSchema },
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
    password : { type : String, default : ""}
});

module.exports = {

    Post : mg.model('Post', PostSchema),
    User : mg.model('User', UserSchema),
    Config : mg.model('Config', ConfigSchema),
    Comment : mg.model('Comment', CommentSchema),

    init : function(dburi, callback) {
        mg.connect(dburi, callback);
    }
}

