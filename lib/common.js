
var util = require('util');
var model = require('./model');

module.exports = {

	// @brief Initialize general data
	// @param meta an object pass as x.data.meta
	begin : function(meta){
		if (typeof meta !== 'object' && !util.isArray(meta))
			meta = {};

		return function(x) {
			x.data = {};
			x.data.meta = meta;
			x.data.meta.renderStamp = Date.now();
			x();
		}
	},

	// @brief: Get config object from database
	// @note: This function is not dependent on begin
	getConfig : function() {
		return function(x) {
			model.Config.findOne(function(err, cfg) {
				if (err)
					x(err);
				else {
					x.config = cfg;
					x();
				}
			});
		}
	},

	// @brief: Get navigation info bar navbar of the page
	// @note: This function dependent on begin
	navigationInfo : function() {
		return function(x) {
			// TODO: Query it from data base other than hard coded here
			x.data.navbar = [{
				item : "Home",
				uri : "/"
			}, {
				item : "About",
				uri : "/about"
			}];
			x();
		}
	}
}
