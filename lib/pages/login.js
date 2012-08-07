var crypto = require('crypto');
var con = require('console');
var model = require('../model');

module.exports = function(app) {
	// TODO: TLS
	app.get('/login', function(req, res) {
		if (req.session.stayLogin) {
			res.redirect(302, '/dashboard');
		} else {
			res.render('login.jade');
		}
	});

	app.post('/login', function(req, res) {
		var username = req.body.username;
		var password = req.body.checksum;
		con.log('POST /login');

		model.Account.findOne({username : username}, function(ex, doc) {
			if (doc != null) {
				con.log('Found account:')
				con.log(doc);
				var sha1 = crypto.createHash('sha1');
				sha1.update(username);
				sha1.update(doc.passwordHash);

				if (password == sha1.digest('hex')) {
					// Login success

					if (req.body.stayLogin)
						req.session.stayLogin = true;

					req.session.username = username;
					res.json({redirect : '/dashboard'});
					return;
				}
		   	}
			res.json(403, { error : 'Username or password missmatch'});
		});
	});
}
