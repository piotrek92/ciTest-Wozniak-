var http = require('http');

http.createServer(function (request, response) {
    response.writeHead(800, {'Content-Type': 'text/plain'});
    response.end('Hello World new test\n');
}).listen(8080);

console.log('Server started');