//Nothing yet here implemented just dumb http server,
// I hope later today ill implement inputWrapper into this
// server

// Include Express
const express = require('express');
// const timeInput = require('./modules/time.js');
const inputStream = require('./modules/inputStreamWrapper.js');
const gpsInput = require('./modules/gps/gps.module.js');
// const accInput = require('./modules/lsm303/accelerometer.js');
const dataLogger = require('./modules/data-logger/data-logger.module.js');
var fs = require('fs');
var configJSON = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Create a new Express application
var server = express();

// Add a basic route – index page
server.get('/', function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
});




// // Bind to a port
server.listen(8000);
console.log('Application running!');
dataLogger.configure(configJSON);
// const myTimeInputStream = new inputStream(timeInput,{},500);
// myTimeInputStream.on('readable', function () {
//     process.stdout.write("Time: ");
//     var tim = myTimeInputStream.read();
//     console.log(tim);
// });
// const myGpsInputStream = new inputStream(gpsInput,{},1000);
// myGpsInputStream.on('readable', function () {
//     process.stdout.write("GPS: ");
//     var gpsObject = myGpsInputStream.read();
//     console.log(gpsObject.time);
// });
// const myAccInputStream = new inputStream(accInput,{},1000);
// myAccInputStream.on('readable', function () {
//     process.stdout.write("GPS: ");
//     var accObject = myAccInputStream.read();
//     console.log(accObject);
// });

