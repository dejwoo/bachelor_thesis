//Nothing yet here implemented just dumb http server,
// I hope later today ill implement inputWrapper into this
// server

// Include Express
const server = require('express');
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
app.listen(8000);
console.log('Application running!');
// const myTimeInputStream = new inputStream(timeInput,{},1000);
// myTimeInputStream.on('readable', function () {
//     var buf = myTimeInputStream.read();
//     console.log(buf.toString());
// });
// myTimeInputStream._source.readStart()
