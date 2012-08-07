var mg = require('mongoose');
mg.connect('mongodb://localhost/nodian');

var AccountSchema = new mg.Schema({
    // Username
	username : {
        type : String,
        index : { unique : true, dropDups : true}
    },

    // SHA1(password)
	passwordHash : String,

    // Email address
	email : String
});

var PostSchema = new mg.Schema({
    title : String,
    body : String,
    date : Date
});

module.exports = {
    Account : mg.model('Account', AccountSchema),
    Post : mg.model('Post', PostSchema),
}

