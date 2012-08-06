
var exp = require('express');
var crypto = require('crypto');
var con = require('console');
var path = require('path');
var asch = require('asyncchain');
var fs = require('fs');

asch.create().append(function(ctx){
	crypto.randomBytes(16, function(ex, buf){
		if (ex) {
			con.error('unable to generate random session key, abort');
			ctx.abort();
			throw ex;
		}
		con.info('random session key loaded.');
		ctx.data.sessionKey = buf.toString('hex');
		ctx.end();
	});
}).append(function(ctx){
	var app = exp.createServer();
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

	fs.readdir(__dirname + '/pages/', function(err, files) {
		if (!err) {
			files.forEach(function(f){
				var module = path.resolve(__dirname + '/pages/' + '/./' + f);
				if (module.search(/\.js$/))
					module = module.replace(/\.js$/, '');
				else
					return ; // Ignoring non js file
				con.log('loading ' + module);
				require(module)(app); // Init module
			});
			app.listen(8080);
		} else {
			con.error('unable to load modules');
		}
		ctx.end();
	});
}).begin();
