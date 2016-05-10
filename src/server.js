
const dataLogger = require('./modules/data-logger/data-logger.module.js');
var fs = require('fs');
var configJSON = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var swig = require('swig');
const _ = require('lodash');
var html = require('./routes/html');
var api = require('./routes/api');
swig.setDefaults({ varControls: ['<{', '}>'] });


// Create a new Express application
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(session({
  secret: 'super duper secret'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api);
app.use('*', html);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// // Bind to a port

http.listen(8000, function(){
  console.log('Application running!');
});
dataLogger.configure(configJSON);
setTimeout(function() {
  dataLogger.configureModule("timeModule", { moduleOptions: {sampleRate : 500} });
},5000);
//setTimeout(function() {dataLogger.configureInputSource("timeInput", {"sampleRate":2000})}, 3000 );
// listen for TERM signal .e.g. kill
process.on('SIGTERM', function() {
    dataLogger.shutdown();
} );
// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', function() {
  dataLogger.shutdown();
});
io.on('connection', function(socket){
  console.log("IO connected");
  _.forIn(dataLogger.modules, function(module, id) {
     if (! _.isUndefined(module.on)) {
      module.on('data', function(data) {
        socket.emit('data',id,data);
      })
     }
  });
});


module.exports = app;