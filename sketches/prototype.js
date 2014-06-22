var http = require('http');
var EnvironmentConfigProvider = require('../index').EnvironmentConfigProvider;

console.log('=== prototype.js ===');

var server = http.createServer(function serveHello(request, response){
	response.end('Hello, world!');
});

var listening = false;
function startListening(port){
	if(listening){
		server.close();
	}
	server.listen(port);
	listening = true;
}

var configProvider = new EnvironmentConfigProvider();
console.log('process.env =', process.env);
configProvider.on('config.http.port', function(port){
	startListening(Number(port));
	console.log('Listening on: %d', port);
});