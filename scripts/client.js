var $ = require('jquery');

$(function(){

	$('#compose-comment').submit(function(e) {
		var postdata = { name : $('#compose-comment input[name="name"]').val(),
					   , body : $('#compose-comment input[name="email"]').val(),
					   , webist : $('#compose-comment input[name="website"]').val(),
					   } ;

		$.post('/post', postdata, function(data) {
			var
			$('<div/>').addClass('comment');
		}).faile(function() {
		});

		return false;
	});
})();
