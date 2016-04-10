const EventEmitter = require('events');
const util = require('util');
const serialport = require('serialport')
const SerialPort = serialport.SerialPort;


function GPSource(options) {
	var self = this;
    self.options = {};
	//configuration from mainApp
	if (typeof options === 'undefined') {
		self.options.device = options.device
	} else {
		if (typeof options.device !== 'undefined') {
			self.options.device = options.device
		} else {
			self.options.device = "/dev/ttyUSB1"
		}
	}

	self.serial = new SerialPort(self.options.device, {
		baudrate:4800,
		parser: serialport.parsers.readline('\n')
	});
	self.serial.on('open', function() {
		console.log('open');
		self.serial.on('data', function(err,results) {
			console.log(err);
			console.log(results);
		});
	});

}

var gp = new GPSource({});
