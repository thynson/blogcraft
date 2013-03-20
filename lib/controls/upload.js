var con = require('console');
var fs = require('fs')
var path = require('path');
var uuid = require('node-uuid');
var xchain = require('xchain');
var common = require('../common');

var basepath = path.resolve(__dirname + '/../../upload');
var basetmppath = path.resolve(__dirname + '/../../tmpupload');

//
// TODO: Quota and access permission
// XXX:  Before they are implemented, this app should not be deployed to
// public accessible places
//

module.exports = function(app) {
	app.put('/upload/:filename', function(req, res, next) {
		var tmppath = path.resolve(basetmppath, uuid.v1());
		var filepath = path.resolve(basepath, req.params['filename']);
		con.log('Creating tmp file ' + tmppath);
		var tmpfile = fs.createWriteStream(tmppath, {
			flag : 'w',
			mode : 0660
		});
		tmpfile.on('error', function(err) {
			next(err);
		});
		tmpfile.on('finish', function() {
		});
		tmpfile.on('close', function() {
			con.log('Rename ' + tmppath + ' to ' + filepath);
			fs.rename(tmppath, filepath, function(err) {
				if (err) return next(err);
				res.set({ 'Location' : '/upload/' + req.params['filename']});
				res.status(201).end();
			});
		});
		req.pipe(tmpfile);
	});

	app.get('/upload/:filename', function(req, res, next) {
		var filepath = path.resolve(basepath, req.params['filename']);
		con.log('Request uploaded file ' + filepath);
		var file = fs.createReadStream(filepath);
		var opened = false;
		file.on('error', function(err) {
			con.log(err);
			if (!opened) next(new common.httpError(404, 'Not found'));
			else {
				file.destroy();
				res.end();
			}
		});

		file.on('open', function() {
			opened = true;
			res.status(200);
			file.pipe(res);
		});
	});
}
