const EventEmitter = require("events");
const util = require("util");
const serialport = require("serialport")
const SerialPort = serialport.SerialPort;
const _ = require("lodash");
const Writable = require('stream').Writable;

"use strict";
SmsModule = function(moduleConfig) {
	EventEmitter.call(this);
	var self = this;
    this.moduleConfig = {};
    if (_.isUndefined(moduleConfig)) {
		this.moduleConfig.device = "/dev/ttyUSB2"
		this.moduleConfig.failedDelay =  3000;
		this.moduleConfig.number = "0901744988";
		this.moduleConfig.maxQueue = 10;
	} else {
		//got config device
		this.moduleConfig = moduleConfig;
		if (_.isUndefined(this.moduleConfig.device)) {
			// did receive config, but no device specified.
			console.error("sms.module: Undefined serial device, setting default /dev/ttyUSB2");
			this.moduleConfig.device = "/dev/ttyUSB2";
		}
		this.moduleConfig.device = _.isUndefined(this.moduleConfig.device) ? "/dev/ttyUSB2" : this.moduleConfig.device;
		this.moduleConfig.failedDelay = _.isUndefined(this.moduleConfig.failedDelay) ? 3000 : this.moduleConfig.failedDelay;
		this.moduleConfig.number = _.isUndefined(this.moduleConfig.number) ? "0901744988" : this.moduleConfig.number;
		this.moduleConfig.maxQueue = _.isUndefined(this.moduleConfig.maxQueue) ? 10 : this.moduleConfig.maxQueue;
	}
	//streamOptions potentially passed from config, objectMode is not configurable
    if (_.isUndefined(this.moduleConfig.streamOptions)) {
		var streamOptions = {};
	} else {
		var streamOptions = this.moduleConfig.streamOptions;
	}
  	//this settings must be always set to this value
  	streamOptions.objectMode = true;
  	//module accepting incoming data have to be instance of Writable stream
  	Writable.call(this, streamOptions);
	this.configure();
}
Object.setPrototypeOf(SmsModule.prototype, Writable.prototype);

SmsModule.prototype.configure = function() {
	this.queue = [];
	this.cmdToRespond = "";
	this.emitOuput = {};
	this.supportedPids = {};
	this.cmdToLoop = [];
	this.ready = false;
}
SmsModule.prototype.init = function() {
	var self = this;
	console.log(this.moduleConfig);
	this.serial = new SerialPort(this.moduleConfig.device, {
		baudrate:9600,
		parser: serialport.parsers.readline('\r\n')
	});
	this.ready = false;
	this.serial.on("error", function (err) {
        console.log("Serial port [" + self.moduleConfig.device + "] is not available!");
    });
	this.serial.on("open", function (err) {
		self.ready = true;
		self.initQueue();
		self.registerListeners();
		self.sendInitCmds();
    });
}
SmsModule.prototype.registerListeners = function() {
	var self = this;

    this.serial.on("data", function(response,err) {
    	if (err) {
			console.error(err);
			return;
		}
		// in case of TEXT response > tends to be there, \n till we set no newline
		if (response === "") {
			return
		}
		response = response.split("\r");
		//only one packet of data arrived, no multi message
		if (response.length == 1) {
			var packet = _.head(response);
			if (packet === "ERROR") {
				console.error("sms.module.on.data: Command ["+self.cmdToRespond+"] not recognized by the device");
				self.nextCmd();
				return;
			}
			if (packet === "NO CARRIER") {
				console.error("sms.module.on.data: Unable to connect to carrier, trying again in "+self.moduleConfig.failedDelay+" ms");
				self.tryCmdAgain();
				return;
				//TODO: interval repetition of failed command
			}
			self.emit("data", "CMD: " + self.cmdToRespond + " RESPONSE: " + response);
			if (packet === "OK") {
				self.nextCmd();
			}
		}
    });
}
SmsModule.prototype.nextCmd = function() {
	this.cmdInProgress = false;
	this.emit("sendCmd");
}
SmsModule.prototype.tryCmdAgain = function() {
	var self = this;
	setTimeout(function(){
					self.queue = _.concat(self.cmdToRespond,self.queue);
					self.nextCmd();
				},self.moduleConfig.failedDelay);
}

SmsModule.prototype.initQueue = function() {
	var self = this;
	this.on("sendCmd", function() {
		if (self.cmdInProgress == true) {
           console.info("sms.module.processQueue: awaitingReply!");
           return;
        }
        if (self.queue.length > 0 && self.ready) {
        	self.cmdInProgress = true;
        	self.cmdToRespond = self.queue[0];
            try {
		var cmdToSend = self.queue.shift();
		if (_.isArray(cmdToSend)) {
			for (var index=0; index < cmdToSend.length; index++) {
				self.serial.write(cmdToSend[index] + "\r");
			}
		} else {
			self.serial.write(cmdToSend + "\r");
		}
            } catch (err) {
                console.error(err);
            }
        }
	});
}
SmsModule.prototype.sendInitCmds = function() {
	var self = this;
	if (this.serial && this.ready) {
		this.sendCmd("ATI");
		this.sendCmd("ATE0");
		this.sendCmd("AT+CMGF=1");
	}
}

SmsModule.prototype.sendCmd = function(cmd) {
	var self = this;
	if (this.ready) {
        if (this.queue.length < this.moduleConfig.maxQueue) {
        	try {
	            self.queue.push(cmd);
        	} catch (err) {
        		console.error(err);
        	}
            if (!this.cmdInProgress) {
                this.emit("sendCmd");
            }
        } else {
            console.error("sms.module.sendCmd: Maximum Queue reached!");
        }
    } else {
        console.error("sms.module.sendCmd:Serial port is not ready!");
    }
}
SmsModule.prototype.close = function() {
	var self = this;
	if (! _.isUndefined(this.serial)) {
		this.serial.close(function(err) {
			if (err) {
					console.info("sms.source: Emmiting err on close");
					self.emit("err", err);
			}
			self.emit("end");
		});
	}
}
SmsModule.prototype._write = function(chunk, encoding, cb) {
	//write method of Writable stream, if stream is in object mode,
	//we can ingore encoding and send object directly, usually nothing else needed here.
	this.send(chunk, cb);
}
SmsModule.prototype.send = function (data,cb) {
	//if module is accepting data, this function is primarily to send data to defined destination in module
	var msg = [data.body.sosMsg,JSON.stringify(_.last(data.body.info.gps)),JSON.stringify(data.body.info.gforce)];
	for (var index = 0; index < msg.length; index++) {
		this.sendCmd(['AT+CMGS=\"'+ this.moduleConfig.number + '"',msg[index],'\x1A']);
	}
	if (cb) {
		cb();
	}
}
module.exports = SmsModule;
