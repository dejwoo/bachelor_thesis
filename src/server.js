//Nothing yet here implemented just dumb http server,
// I hope later today ill implement inputWrapper into this
// server

// Include Express
const express = require('express');
const timeInput = require('./modules/time.js');
const inputStream = require('./modules/inputStreamWrapper.js');
const gpsInput = require('./modules/gps/gps.module.js');

// Create a new Express application
var server = express();

// Add a basic route – index page
server.get('/', function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
});




// // Bind to a port
server.listen(8000);
console.log('Application running!');
const myTimeInputStream = new inputStream(timeInput,{},500);
myTimeInputStream.on('readable', function () {
    process.stdout.write("Time: ");
    console.log(myTimeInputStream.read().toString());
});
const myGpsInputStream = new inputStream(gpsInput,{},1000);
myGpsInputStream.on('readable', function () {
    process.stdout.write("GPS Time: ");
    console.log(myGpsInputStream.read().time);
});

