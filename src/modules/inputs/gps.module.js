const EventEmitter = require('events');
const util = require('util');
const serialport = require('serialport')
const SerialPort = serialport.SerialPort;
const GPS = require('gps');
var gps = new GPS;


function GpsInputSource(options) {
  	EventEmitter.call(this);
	var self = this;
    self.options = {};
	//did not receive any configuration from main app, configuring by defaults
	if (typeof options === 'undefined') {
		self.options.device = options.device
		self.options.sampleRate = 0;
	} else {
		//got config device
		if (typeof options.device !== 'undefined') {
			self.options.device = options.device
		// did receive config, but no device specified.	
		} else {
			self.options.device = "/dev/ttyUSB1"
		}
	}

	self.serial = new SerialPort(self.options.device, {
		baudrate:4800,
		parser: serialport.parsers.readline('\n')
	});
	if (typeof self.serial === 'undefined') {
		console.error("GPS.source: Something wrong with creating serial port.");
	}
	

}
GpsInputSource.prototype.readStart = function () {
	var self = this;
	console.log("GPS.source: Starting sending data!");
	self.serial.on('open', function() {
		console.info('GPS.source: Opened NMEA serial port.');
		self.serial.on('data', function(result,err) {
			if (typeof err != 'undefined') {
				console.info('GPS.source: Emmiting err' + err);
				self.emit('error', err);
				return;
			}
			//console.info('GPS.source: Emmiting data' + result);
			gps.update(result);
			self.emit('data', gps.state);
		});
	});
}
GpsInputSource.prototype.readStop = function () {
	var self = this;
	self.serial.close(function(err) {
		if (err) {
				console.info('GPS.source: Emmiting err on close');
				self.emit('err', err);
		}
		self.emit('end');
	});
}
util.inherits(GpsInputSource, EventEmitter);

module.exports = GpsInputSource;
