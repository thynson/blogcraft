var x = require('bootstrap');
var $ = require('jquery');

var isModify = false;

$('#btn-new-post').click(function(e) {
	isModify = false;
	$('#form-new-post').reset();
});

$('#form-new-post').submit(function(e) {
	e.preventDefault();
	var postdata = { title : $('#form-new-post input[name="title"]').val()
				   , body : $('#form-new-post textarea[name="body"]').val() };

	//TODO: Veryfy data

	if (isModify) {
		postdata.id = $('#form-new-post input[name="id"]').val();
	}


	$.post('/post', postdata, function(data) {
		$('a[href="#manage"]').tab('show');
	}).fail(function() {
		alert('Failed');
	});
});

$('a[data-toggle="tab"]').on('shown', function(e) {

	var x = $(e.target);
	var currentTabId = $(e.target).attr('href');
	var relatedTabId = $(e.relatedTarget).attr('href');
	var postListTable = $('#post-list tbody');

	switch(currentTabId) {

	case '#edit':
		(function() {
		});

	case '#manage':
		(function(){
			$.get('/ajax/post', function(data) {
				postListTable.empty();
				$.each(data, function(idx, value) {
					setTimeout(function(){
						var tr = $('<tr/>').appendTo(postListTable);
						$('<td/>').text(value.title).appendTo(tr);
						$('<td/>').text(value.modifiedDate).appendTo(tr);

						var td = $('<td/>').appendTo(tr);
						var buttonGroup = $('<div/>')
										  .addClass('btn-group')
										  .appendTo(td);

						$('<button/>')
						.addClass('btn')
						.text('Remove')
						.click(function(e) {
							$.post('/ajax/post/delete'
							, { id : value._id}
							, function(){
								tr.remove();
							}).fail(function(){
								alert('Faild');
							});
						}).appendTo(buttonGroup);

						$('<button/>')
						.addClass('btn')
						.text('Edit')
						.click(function(e) {
							isModify = true;
							$('#edit input[name="id"]').val(value._id);
							$('#edit input[name="title"]').val(value.title);
							$('#edit textarea[name="body"]').val(value.source);
							$('a[href="#edit"]').tab('show');
						}).appendTo(buttonGroup);

					}, idx);
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


