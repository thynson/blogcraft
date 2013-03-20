var con = require('console');
var model = require('../model');
var mg = require('mongoose');
var common = require('../common');

module.exports = function(app) {
	app.put(model.validate.customUrl, function(req, res, next) {
		var customUrl = req.path;
		var uuid = null;
		try {
			uuid = mg.Types.ObjectId.createFromHexString(req.body.post);
		} catch (err) {
			return next(new common.httpError(400, 'Invalid argument'));
		}

		con.log('Request creating custom url for ' + uuid);

		model.Post.findOne({ _id : uuid }).exec(function(err, post) {
			if (err) return next(err);

			model.CustomUrl.findOneAndUpdate({
				customUrl : customUrl
			}, {
				post : uuid,
				customUrl : customUrl
			}, {
				upsert : true
			}, function(err) {
				if (err) return next(err);
				res.set({'Location' : customUrl});
				res.status(201).end();
			});
		});
	});
}
