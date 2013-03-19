var request = require('request');
var con  = require('console');


var content = '';
process.stdin.on('data', function(data) { content += data; });
process.stdin.on('end', function() {
	try {
		content = JSON.stringify(JSON.parse(content)) + '\n';
	} catch(error) {
		con.err('Invalid JSON');
		process.exit();
	}
	con.log(content);

	request.post({
		url : 'http://localhost:8080/post',
		headers : { 'Content-Type' : 'application/json' },
		body : content
	}, function(error, response, body) {
		con.log(response);
		con.log(body);
	});
});
process.stdin.resume();
