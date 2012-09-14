
var exp = require('express');
var crypto = require('crypto');
var con = require('console');
var path = require('path');
var xchain = require('xchain');
var http = require('http');
var fs = require('fs');
var model = require('./model');

xchain(function(next){
	var config = {};
	con.info('parsing nodepress configuration');
	if (process.env.NODIAN_CONFIG) {
		try {
			config = JSON.parse(process.env.NODIAN_CONFIG);
		} catch (err) {
			con.error('unable to parse nodepress configuration variable');
			throw err;
			return ;
		}
	}

	config.dburi = config.dburi || 'mongodb://localhost/nodepress';
	config.password = config.password || 'nodepress';

	next.config = config;

	con.info('connecting MongoDB...');
	model.init(config.dburi, function(err){
		if (!err) {
			con.info('MongoDB connected.');
			next();
		} else {
			con.error('Error when connecting MongoDB.');
			next();
			throw err;
		}
	});
})(function(next){
	var app = exp();

	app.configure(function(){
		app.set('views', path.resolve(__dirname + '/../views'))
		app.use(exp.bodyParser());
		app.use(exp.compress());
		app.use('/css', exp.static(path.resolve(__dirname + '/../static/css')));
		app.use('/js', exp.static(path.resolve(__dirname + '/../static/js')));
		app.use(app.router);
		app.use(function(req, res) {
			throw { status : 404 };
		});
		app.use(function(err, req, res, next){
			if (!(typeof err.status === 'number' && err.status >= 400
			&& err.status < 600 && http.STATUS_CODES[err.status])) {
				// Fallback non-recognized status code to 500
				err.status = 500;
				con.log(err);
			}
			res.status(err.status).render('error.jade', {
				info : String(err.status) + ' ' + http.STATUS_CODES[err.status]
			});
		});
	});

	var server = http.createServer(app);

	var controlsDir = __dirname + '/controls/';

	fs.readdir(controlsDir, function(err, files) {
		if (!err) {
			try {
				files.forEach(function(f){
					var module = path.resolve(controlsDir + '/./' + f);
					if (module.match(/^.*\.js$/))
						module = module.replace(/^\.js$/, '');
					else
						return ; // Ignoring non js file
					con.log('loading ' + module);
					require(module)(app); // Init module
				});
				server.listen(8080);
				next();
			} catch(err) {
				throw err;
				con.error('unable to load modules');
			}
		} else {
			con.error('unable to load modules');
			throw err;
		}
	});
}).run();
