const EventEmitter = require("events");
const util = require("util");
const serialport = require("serialport")
const SerialPort = serialport.SerialPort;
const PIDs = require("./obd.pids.js");
const _ = require("lodash");
"use strict";
SmsModule = function(moduleConfig) {
	EventEmitter.call(this);
	var self = this;
    this.moduleConfig = {};
    if (_.isUndefined(moduleConfig)) {
		this.moduleConfig.device = "/dev/ttyUSB2"
		this.moduleConfig.failedDelay =  3000;
		this.moduleConfig.number = 0901744988;
		this.moduleConfig.maxQueue = 10;
	} else {
		//got config device
		this.moduleConfig = moduleConfig;
		if (_.isUndefined(this.moduleConfig.device)) {
			// did receive config, but no device specified.
			console.error("obd.module: Undefined serial device, setting default /dev/ttyUSB2");
			this.moduleConfig.device = "/dev/ttyUSB2";
		}
		this.moduleConfig.device = _.isUndefined(this.moduleConfig.device) ? 100 : this.moduleConfig.device;
		this.moduleConfig.failedDelay = _.isUndefined(this.moduleConfig.failedDelay) ? 3000 : this.moduleConfig.failedDelay;
		this.moduleConfig.number = _.isUndefined(this.moduleConfig.number) ? 0901744988 : this.moduleConfig.number;
		this.moduleConfig.maxQueue = _.isUndefined(this.moduleConfig.maxQueue) ? 10 : this.moduleConfig.maxQueue;
	}
	this.configure();
}
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
		// var firstChar = response.substr(0,1);
  //   	if (firstChar === "\n" || firstChar === ">") {
		// 	response = response.substr(1);
		// 	firstChar = response.substr(0,1);
		// 	if (firstChar === ">") {
		// 		response = response.substr(1);
		// 	}
		// }
		response = response.split("\r\n");
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
			console.log("RESPONSE", response);
		}
		setTimeout(function() {self.nextCmd();},50);
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
                self.serial.write(self.queue.shift() + "\r\n");
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
		this.sendCmd("AT+CMGF=1");
	}
}

SmsModule.prototype.sendCmd = function(cmd) {
	var self = this;
	if (this.ready) {
		console.log(self.queue);
		console.log(this.moduleConfig.maxQueue);
        if (this.queue.length < this.moduleConfig.maxQueue) {
        	try {
	            self.queue.push(cmd);
	            console.log(self.queue);
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
util.inherits(SmsModule, EventEmitter);

// module.exports = SmsModule;
var s = new SmsModule();
s.init();
