var mg = require('mongoose');
mg.connect('mongodb://localhost/nodian');

var AccountSchema = new mg.Schema({
	username : { type : String, index : { unique : true, dropDups : true }},
	passwordHash : String,
	email : String
});

var PostSchema = new mg.Schema({
    author : { type : mg.Schema.ObjectId, ref : 'Account' },
    title : { type :String, validate : /.+/},
    body : String,
    createdDate : { type : Date, default : Date.now() },
    modifiedDate : { type : Date, default : Date.now() }
});

module.exports = {
    Account : mg.model('Account', AccountSchema),
    Post : mg.model('Post', PostSchema),
}

