
var util = require('util');
var con = require('console');
var http = require('http');
var model = require('./model');

module.exports = {

	// @brief Initialize general data
	// @param meta an object pass as req.data.meta
	begin : function(meta){
		if (typeof meta !== 'object' && !util.isArray(meta))
			meta = {};

		return function(req, res, next) {
			var data = req.data = {};
			data.meta = meta;
			data.meta.renderStamp = Date.now();
			next();
		}
	},

	// @brief: Get config object from database
	// @note: This function is not dependent on begin
	getConfig : function() {
		return function(req, res, next) {
			model.Config.findOne(function(err, cfg) {
				if (err)
					next(err);
				else {
					var meta = req.data.meta;
					req.data.config = cfg;

					// @brief Check if page param is valid
					req.data.checkPage = function(count, next) {
						if ((meta.page - 1) * cfg.pageMaxArtical > count) {
							next(module.exports.httpError(404,
								"Query page not exists"));
							return false;
						}
						return true;
					};

					// @brief Calculate the upper boundry and lower boundry of
					// 		  page navigation
					req.data.calculatePageRange = function(count) {
						meta.count = count;
						meta.maxPage = Math.ceil(count / cfg.pageMaxArtical);

						if (meta.maxPage == 0)
							meta.maxPage = 1;

						meta.startPage = meta.page - 4;
						if (meta.startPage < 1)
							meta.startPage = 1;

						meta.endPage = meta.startPage + 8;
						if (meta.endPage > meta.maxPage)
							meta.endPage = meta.maxPage;
					}
					next();
				}
			});
		}
	},

	// @brief: Get navigation info bar navbar of the page
	// @note: This function dependent on begin
	navigationInfo : function() {
		return function(req, res, next) {
			// TODO: Query it from data base other than hard coded here
			req.data.navbar = [{
				item : "Home",
				uri : "/"
			}, {
				item : "About",
				uri : "/about"
			}];
			next();
		}
	},

	// @brief: Construct an Http error
	httpError : function(status, message) {
		var error = new Error(message);
		error.status = status;
		return error;
	},

	// @brief: NotFound handler
	notFoundHandler : function() {
		return function(req, res, next) {
			next(module.exports.httpError(404, 'Request of '
				+ req.url + 'not found'));
		}
	},

	errorHandler : function() {
		return function(err, req, res, next) {
			if (!(typeof err.status === 'number' && err.status >= 400
			&& err.status < 600 && http.STATUS_CODES[err.status])) {
				// Fallback non-recognized status code to 500
				err.status = 500;
				con.log(err);
			}
			res.status(err.status).render('error.jade', {
				status : String(err.status) + ' ' + http.STATUS_CODES[err.status],
				message : err.message || '',
				stack : err.stack
			});
		}
	},
}
