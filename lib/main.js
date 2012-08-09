
var exp = require('express');
var crypto = require('crypto');
var con = require('console');
var path = require('path');
var asch = require('asyncchain');
var http = require('http');
var fs = require('fs');
var model = require('./model');

asch.create().append(function(ctx){
	con.info('generating security session key...');
	crypto.randomBytes(16, function(ex, buf){
		if (ex) {
			con.error('unable to generate random session key, abort');
			ctx.abort();
			throw ex;
		}
		con.info('security session key generated.');
		ctx.data.sessionKey = buf.toString('hex');
		ctx.end();
	});
}, function(ctx){
	con.info('connecting MongoDB...');
	model.init(function(err){
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
		app.set('views', path.resolve(__dirname + '/../view'))
		app.use(exp.bodyParser());
		app.use(exp.compress());
		app.use(exp.cookieParser());
		app.use(exp.session({ key : 'session',
							  secret : ctx.data.sessionKey }));
		app.use(app.router);
		app.use('/css', exp.static(path.resolve(__dirname + '/../static/css')));
		app.use('/js', exp.static(path.resolve(__dirname + '/../static/js')));
	});

	var server = http.createServer(app);

	var controlsDir = __dirname + '/controls/';

	fs.readdir(controlsDir, function(err, files) {
		if (!err) {
			files.forEach(function(f){
				var module = path.resolve(controlsDir + '/./' + f);
				if (module.search(/\.js$/))
					module = module.replace(/\.js$/, '');
				else
					return ; // Ignoring non js file
				con.log('loading ' + module);
				require(module)(app); // Init module
			});
			server.listen(8080);
			ctx.end();
		} else {
			con.error('unable to load modules');
			ctx.abort();
		}
	});
}).begin();
