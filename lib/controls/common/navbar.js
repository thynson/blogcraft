
module.exports = function(x) {
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
