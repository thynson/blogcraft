
var exp = require('express');
var crypto = require('crypto');
var con = require('console');
var path = require('path');
var xchain = require('xchain');
var http = require('http');
var fs = require('fs');
var model = require('./model');
var common = require('./common');

xchain(function(next){
	var env = {};
	con.info('Parsing blogcraft environment configuration');
	if (process.env.BLOG_CRAFT_CONFIG) {
		try {
			env = JSON.parse(process.env.BLOG_CRAFT_CONFIG);
		} catch (err) {
			con.error('Unable to parse blog craft environment configuration variable');
			throw err;
			return ;
		}
	}

	env.dburi = env.dburi || 'mongodb://localhost/blogcraft';

	next.env = env;

	con.info('Connecting ' + env.dburi + '...');
	model.init(env.dburi, function(err){
		if (!err) {
			con.info(env.dburi + ' connected.');
			next();
		} else {
			con.error('Error when connecting ' + env.dburi);
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
		app.use(common.notFoundHandler());
		app.use(common.errorHandler());
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
				con.error('Unable to load modules');
			}
		} else {
			con.error('Unable to load modules');
			throw err;
		}
	});
}).run();
