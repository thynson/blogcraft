var mg = require('mongoose');

var AccountSchema = new mg.Schema({
	id : { type : mg.ObjectId }, 	// Unique id for a user
	username : String,			 	// Username
	passwordHash : String,			// SHA1 of password
	email : String					// Email address
});

var PostSchema = new mg.Schema({
    title : String,
    body : String,
    date : Date
});

module.exports = {
    Account : mg.model('Account', AccountSchema)
    Post : mg.model('Post', PostSchema),
}

