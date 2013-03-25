var x = require('bootstrap');
var $ = require('jquery');

$('a[data-toggle="tab"]').on('shown', function(e) {

	var x = $(e.target);
	var currentTabId = $(e.target).attr('href');
	var relatedTabId = $(e.relatedTarget).attr('href');
	var postListTable = $('#post-list tbody');

	switch(currentTabId) {
	case '#manage':
		(function(){
			$.get('/ajax/post', function(data) {
				postListTable.empty();
				$.each(data, function(idx, value) {
					setTimeout(function(){
						postListTable.append(
							$('<tr/>').append($('<td/>').text(value.title))
							.append($('<td/>').text(value.createdDate))
							.append($('<td/>'))
							.attr('id', value._id)
						);
					}, 0);
				});
			}).fail(function() {
				// TODO:
			});
		})();
		break;
	};


	switch(relatedTabId) {
	case '#manage':
		postListTable.empty();

	};

});
