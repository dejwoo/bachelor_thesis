const EventEmitter = require('events');
const util = require('util');
const serialport = require('serialport')
const SerialPort = serialport.SerialPort;
const PIDs = require('./obdPidList.js');
const _ = require('lodash');
'use strict';
ObdOutput = function(moduleConfig) {
	EventEmitter.call(this);
	var self = this;
    this.moduleConfig = {};
    if (_.isUndefined(moduleConfig) === 'undefined') {
		this.moduleConfig.device = "/dev/ttyACM0"
		this.moduleConfig.sampleRate = 1000;
	} else {
		//got config device
		this.moduleConfig = moduleConfig;
		if (_.isUndefined(this.moduleConfig.device)) {
			// did receive config, but no device specified.
			console.error("obd.module: Undefined serial device, setting default /dev/ttyACM0");
			this.moduleConfig.device = "/dev/ttyACM0"
		}
		this.moduleConfig.maxQueue = _.isUndefined(this.moduleConfig.maxQueue) ? 100 : this.moduleConfig.maxQueue;
		this.moduleConfig.writeDelay = _.isUndefined(this.moduleConfig.writeDelay) ? 40 : this.moduleConfig.writeDelay;
		this.moduleConfig.sampleRate = _.isUndefined(this.moduleConfig.sampleRate) ? 1000 : this.moduleConfig.sampleRate;
	}
	this.configure();
}
ObdOutput.prototype.configure = function() {
	this.queue = []; //fronta PID dotazov/AT prikazov
	this.cmdToRespond = ""; //fronta, FIFO pre spojenie prikazu a odpovede
	this.multiLineResponse = 0; //v pripade viac riadkovych odpovedi, musime vediet ze partia pod jeden prikaz
	this.emitOuput = {}; //objekt v kt. zbieram udaje na poslanie z modulu
	this.multiLineArray = []; //pole v kt. drzim viac riadkove odpovede
	this.ready = false;
}
ObdOutput.prototype.init = function() {
	this.serial = new SerialPort(this.options.device, {
		baudrate:115200,
		parser: serialport.parsers.readline()
	});
	this.ready = false;
	this.serial.on('open', function () {
		self.ready = true;
		self.initQueue();
		self.registerListeners();
		self.sendInitCommands();
    });
}
ObdOutput.prototype.registerListeners = function() {
    this.serial.on('error', function (err) {
        console.log("Serial port [" + self.SERIAL_PORT + "] is not ready");
    });
    this.serial.on('data', function(response,err) {
    	// in case of TEXT response > tends to be there
    	if (err) {
			console.error(err);
			return;
		}
    	if (response.substr(0,1) === '>') {
			response = response.substr(1);
		}
		//case of multimessage
		response = response.split('\r');
		//TODO
		console.log(response);
    });
}
ObdOutput.prototype.initQueue = function() {
	var self = this;
	this.on("sendCmd", function() {
		if (self.cmdInProgress == true) {
           console.info('obd.module.processQueue: awaitingReply!');
           return;
        }
        if (self.queue.length > 0 && self.ready) {
        	self.cmdInProgress = true;
        	self.cmdToRespond = self.queue[0];
            try {
                self.serial.write(self.queue.shift() + '\r');
            } catch (err) {
                console.error(err);
            }
        }
	});
}
ObdOutput.prototype.sendInitCmd = function() {
	if (this.serial && this.ready) {
		//restart ELM
		self.sendCmd('ATZ');
		//turns off echo
  		self.sendCmd('ATE0');
  		//no carriege return
  		self.write('ATL0');
  		//dunno about this
  		self.write('ATS0');
  		//header and checksum off, probably not wise
        self.write('ATH0');
        //Set the protocol to automatic.
        self.write('ATST0A');
        self.write('ATSP0');
	}
}

ObdOutput.prototype.sendCmd = function(cmd) {
	var self = this;
	if (this.ready) {
        if (this.queue.length < this.moduleConfig.maxQueue) {
        	try {
	            self.queue.push(cmd+'\r');
        	} catch (err) {
        		console.error(err);
        	}
            if (!this.cmdInProgress) {
                this.emit('sendCmd');
            }
        } else {
            console.error('obd.module.sendCmd: Maximum Queue reached!');
        }
    } else {
        console.error('obd.module.sendCmd:Serial port is not ready!');
    }
}
ObdOutput.prototype.close = function() {
	var self = this;
	if (! _.isUndefined(this.serial)) {
		this.serial.close(function(err) {
			if (err) {
					console.info('OBD.source: Emmiting err on close');
					self.emit('err', err);
			}
			self.emit('end');
		});
	}
}
util.inherits(ObdOutput, EventEmitter);

module.exports = ObdOutput;