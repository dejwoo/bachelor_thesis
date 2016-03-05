//Nothing yet here implemented just dumb http server,
// I hope later today ill implement inputWrapper into this
// server

// Include Express
var express = require('express');

// Create a new Express application
var app = express();

// Add a basic route – index page
app.get('/', function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
});




// Bind to a port
app.listen(8000);
console.log('Application running!');