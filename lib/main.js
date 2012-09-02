
var exp = require('express');
var crypto = require('crypto');
var con = require('console');
var path = require('path');
var asch = require('asyncchain');
var http = require('http');
var fs = require('fs');
var model = require('./model');

asch.create().append(function(ctx){
	var config = {};
	con.info('parsing nodian configuration');
	if (process.env.NODIAN_CONFIG) {
		try {
			config = JSON.parse(process.env.NODIAN_CONFIG);
		} catch (err) {
			con.error('unable to parse nodian configuration variable');
			ctx.abort();
			return ;
		}
	}

	config.dburi = config.dburi || 'mongodb://localhost/nodian';
	config.password = config.password || 'nodian';

	ctx.data.config = config;

	con.info('connecting MongoDB...');
	model.init(config.dburi, function(err){
		if (!err) {
			con.info('MongoDB connected.');
			ctx.end();
		} else {
			con.error('Error when connecting MongoDB.');
			ctx.abort();
			throw err;
		}
	});
}).append(function(ctx){
	var app = exp();

	app.configure(function(){
		app.set('views', path.resolve(__dirname + '/../views'))
		app.use(exp.bodyParser());
		app.use(exp.compress());
		app.use('/css', exp.static(path.resolve(__dirname + '/../static/css')));
		app.use('/js', exp.static(path.resolve(__dirname + '/../static/js')));
		app.use(app.router);
		app.use(function(req, res) {
			throw {};
			res.status(404).render('error.jade', {
				info : '404 Not found'
			});
		});
		app.use(function(err, req, res, next){
			res.status(500).render('error.jade', {
				info : '500 Internal Server Error'
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
				ctx.end();
			} catch(err) {
				con.error('unable to load modules');
			}
		} else {
			con.error('unable to load modules');
			ctx.abort();
		}
	});
}).begin();
