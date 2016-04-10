const EventEmitter = require('events');
const util = require('util');
const SerialPort = require('serialport').SerialPort;


function GPSource(options) {
	var self = this;
	//configuration from mainApp
	if (typeof options !== 'undefined') {
		if (typeof options.device !== 'undefined') {
			self.options.device = options.device
		} else {
			self.options.device = "/dev/ttyUSB1"
		}
	} else {
		console.error("gps.module: No configuration from main app.");
	}
	
	self.serial = new SerialPort(self.options.device, {
		baudrate:4800
		parser: serialport.parsers.readline('\n')
	});
	self.serial.on('open').then( function() {
		console.log('open');
		self.serial.on('data').then( function(err,results) {
			console.log(err);
			console.log(results);
		})
	}

}

exports GPSource;