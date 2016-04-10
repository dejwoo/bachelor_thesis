const EventEmitter = require('events');
const util = require('util');
const serialport = require('serialport')
const SerialPort = serialport.SerialPort;


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
	if (typedef self.serial === 'undefined') {
		console.error("GPS.source: Something wrong with creating serial port.");
	}
	

}
GpsInputSource.prototype.readStart = function () {
	self.serial.on('open', function() {
		console.info('GPS.source: Opened NMEA serial port.');
		self.serial.on('data', function(err,results) {
			if (err) {
				console.info('GPS.source: Emmiting err');
				self.emit('err', err);
			}
			console.info('GPS.source: Emmiting data');
			self.emit('data', results)
		});
	});
}
GpsInputSource.prototype.readStop = function () {
	self.serial.close(function(err) {
		if (err) {
				console.info('GPS.source: Emmiting err on close');
				self.emit('err', err);
		}
		self.emit('end');
	});

util.inherits(GpsInputSource, EventEmitter);
export GpsInputSource;
