const EventEmitter = require("events");
const util = require("util");
const serialport = require("serialport")
const SerialPort = serialport.SerialPort;
const PIDs = require("./obd.pids.js");
const _ = require("lodash");
"use strict";
ObdOutput = function(moduleConfig) {
	EventEmitter.call(this);
	var self = this;
    this.moduleConfig = {};
    if (_.isUndefined(moduleConfig)) {
		this.moduleConfig.device = "/dev/ttyACM0"
		this.moduleConfig.sampleRate = 4000;
		this.moduleConfig.maxQueue = 100;
		this.moduleConfig.failedDelay = 3000;
	} else {
		//got config device
		this.moduleConfig = moduleConfig;
		if (_.isUndefined(this.moduleConfig.device)) {
			// did receive config, but no device specified.
			console.error("obd.module: Undefined serial device, setting default /dev/ttyACM0");
			this.moduleConfig.device = "/dev/ttyACM0"
		}
		this.moduleConfig.maxQueue = _.isUndefined(this.moduleConfig.maxQueue) ? 100 : this.moduleConfig.maxQueue;
		this.moduleConfig.writeDelay = _.isUndefined(this.moduleConfig.writeDelay) ? 50 : this.moduleConfig.writeDelay;
		this.moduleConfig.failedDelay = _.isUndefined(this.moduleConfig.failedDelay) ? 3000 : this.moduleConfig.failedDelay;
		this.moduleConfig.sampleRate = _.isUndefined(this.moduleConfig.sampleRate) ? 1000 : this.moduleConfig.sampleRate;
	}
	this.configure();
}
ObdOutput.prototype.configure = function() {
	this.queue = []; //fronta PID dotazov/AT prikazov
	this.cmdToRespond = ""; //fronta, FIFO pre spojenie prikazu a odpovede
	this.emitOuput = {}; //objekt v kt. zbieram udaje na poslanie z modulu
	this.supportedPids = {};
	this.cmdToLoop = [];
	this.ready = false;
}
ObdOutput.prototype.init = function() {
	var self = this;
	this.serial = new SerialPort(this.moduleConfig.device, {
		baudrate:115200,
		parser: serialport.parsers.readline()
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
ObdOutput.prototype.registerListeners = function() {
	var self = this;
// superb
// [ "ELM327/ELM-USB v1.0 (c) SECONS Ltd." ]
// [ "\n>ATE0" ]
// [ " ]
// [ "\nOK" ]
// [ "\n>OK" ]
// [ "OK" ]
// [ "OK" ]
// [ "OK" ]
// [ "BUSINIT: ...OK" ]
// [ "41 00 98 3F 80 11" ]
//fabia
// [ "ELM327/ELM-USB v1.0 (c) SECONS Ltd." ]
// [ "\n>ATE0" ]
// [ " ]
// [ "\nOK" ]
// [ "\n>OK" ]
// [ "OK" ]
// [ "OK" ]
// [ "OK" ]
// [ "41 00 BE 3E B8 13" ]


    this.serial.on("data", function(response,err) {
    	console.log(response);
    	if (err) {
			console.error(err);
			return;
		}
		// in case of TEXT response > tends to be there, \n till we set no newline
		if (response === "") {
			return
		}
		var firstChar = response.substr(0,1);
    	if (firstChar === "\n" || firstChar === ">") {
			response = response.substr(1);
			firstChar = response.substr(0,1);
			if (firstChar === ">") {
				response = response.substr(1);
			}
		}
		if (response === "ATE0" || response === "BUSINIT: ...OK" || response === "ATZ") {
			return
			//case of multimessage
		}
		response = response.split("\r");
		//only one packet of data arrived, no multi message
		if (response.length == 1) {
			var packet = _.head(response);
			if (packet === "ELM327/ELM-USB v1.0 (c) SECONS Ltd.") {
				console.info("obd.module.on.data: ELM327 device restart!");
				self.nextCmd();
				return;
			}
			if (-1 !== _.findIndex(["OK"], function(x) {return x===packet;})) {
				console.log(["obd.module.on.data: Command:", self.cmdToRespond, "Response:", packet].join(" "));
				self.nextCmd();
				return;
			}
			if (packet === "?") {
				console.error("obd.module.on.data: Command/PID ["+self.cmdToRespond+"] not recognized by the device");
				self.nextCmd();
				return;
			}
			if (packet === "UNABLE TO CONNECT") {
				console.error("obd.module.on.data: Unable to connect OBD port, trying again in "+self.moduleConfig.failedDelay+" ms");
				self.tryCmdAgain();
				return;
				//TODO: interval repetition of failed command
			}
			if (packet === "NO DATA") {
				console.error("obd.module.on.data: Unable to retrieve data for command " + self.cmdToRespond);
				setTimeout(function() {self.nextCmd();},50);
				return;
			}
			//parsing response from PID request
			packet = packet.split(' ');		//byte split
			if (packet[1][1] == '0' && (packet[1][0] == '0' || packet[1][0] == '2' || packet[1][0] == '4' || packet[1][0] == '6')) {
				self.parseSupportedPids(packet);
			} else {
				self.parseObdResponse(packet);
			}
		}
		setTimeout(function() {self.nextCmd();},50);
    });
}
function strToHex(strBytes) {
    var output = [];
    for (var index = 0; index < strBytes.length; index++) {
        output.push(parseInt(strBytes[index],16));
    }
    return output;
}
function toStrBin(intBytes) {
    var output = "";
    for (var index = 0; index < intBytes.length; index++) {
        var addString = intBytes[index].toString(2);
        for (var j = addString.length; j < 8; j++) {
        	addString = '0' + addString;
        }
        output += addString;
    }
    return output;
}
ObdOutput.prototype.readStart = function() {
	console.log("START");
}
ObdOutput.prototype.parseSupportedPids = function(packet) {
	var mode = parseInt(packet[0],10)-40;
	var range = parseInt(packet[1][0],10);
	if (_.isUndefined(this.supportedPids[mode])) {
		this.supportedPids[mode] = {};
	}
	if (_.isUndefined(this.supportedPids[mode][range])){
		this.supportedPids[mode][range] = [];
	}
	var payload = packet.slice(2);
	payload = strToHex(payload);
	var binaryPayload = toStrBin(payload);
	for (var index = 0; index < binaryPayload.length; index++) {
		if (binaryPayload[index] == '1') {
			this.supportedPids[mode][range].push(true);
			if ((index+range*16).toString(16) != "0" && (index+range*16).toString(16) != "20" && (index+range*16).toString(16) != "40") {
				console.log(this.createCmd(mode,(index+range*16) ), index);
				this.addCmdToLoop(this.createCmd(mode, index+range*16));
			}
		} else {
			this.supportedPids[mode][range].push(false);
		}
	}
	if (_.last(this.supportedPids[mode][range])) {
		this.sendCmd('0'+mode+(range+2).toString()+'0');
	}
	this.startCmdLoop();
}
ObdOutput.prototype.createCmd = function(mode, cmd) {
	strCmd = cmd.toString(16);
	if (strCmd.length == 1) {
		strCmd = "0" + strCmd;
	}
	return "0" + mode + strCmd;

}
ObdOutput.prototype.addCmdToLoop = function(cmd) {
	var self = this;
	if (-1 === _.findIndex(this.cmdToLoop, function(x) {return x===cmd})) {
		try {
			this.cmdToLoop.push(cmd);
		} catch(err) {
			console.error(err);
		}
	} else {
		console.info("obd.module.addCmdToLoop: cmd["+cmd+"] is already in loop");
	}
	if (!_.isUndefined(this.loopInterval)) {
		this.stopCmdLoop();
		this.startCmdLoop();
	}
}
ObdOutput.prototype.removeCmdFromLoop = function (cmd) {
	var self = this;
	this.cmdToLoop = _.pull(this.cmdToLoop, cmd);
}
ObdOutput.prototype.startCmdLoop = function() {
	if (! _.isUndefined(this.loopInterval)) {
		return;
	}
	var self = this;
	if (this.moduleConfig.sampleRate > this.cmdtoLoop.length*this.moduleConfig.writeDelay) {
		var intervalTime = this.moduleConfig.sampleRate;
	} else {
		var intervalTime = this.cmdtoLoop.length*this.moduleConfig.writeDelay;
		console.info("obd.module.startCmdLoop: sampleRate set to ["+intervalTime+"] due to writeDelay");
	}
	this.loopInterval = setInterval(function(){
		_.map(self.cmdToLoop, function(value){
			self.sendCmd(value);
		});
		console.log(self.queue.length);
	}, intervalTime);
}
ObdOutput.prototype.stopCmdLoop = function() {
	if (_.isUndefined(this.loopInterval)) {
		return;
	}
	clearInterval(this.loopInterval);
}
ObdOutput.prototype.parseObdResponse= function(packet) {
	var modePom = packet[0];
	if (modePom[0] === "4") {
		var mode = "0" + modePom[1];
	} else {
		console.error("obd.module.parseObdResponse: Bad obd response!", packet);
		return;
	}
	var cmd = packet[1];
	var pid = this.getPid(mode,cmd);
	var payload = packet.slice(2);
	payload = strToHex(payload);
	console.log(this.queue.length,pid.description,pid.convert(payload));
	this.emit("data",{"code":pid.code,"response":pid.convert(payload)});;
}
ObdOutput.prototype.getPid = function(mode, cmd) {
	if (! _.isUndefined(PIDs[mode])) {
		if (! _.isUndefined(PIDs[mode][cmd])) {
			return PIDs[mode][cmd];
		} else {
			console.error("obd.module.getPid: Unknown PID command["+cmd+"]!");
		}
	} else {
		console.error("obd.module.getPid: Mode["+mode+"] is unsupported!");
		return;
	}
}
ObdOutput.prototype.nextCmd = function() {
	this.cmdInProgress = false;
	this.emit("sendCmd");
}
ObdOutput.prototype.tryCmdAgain = function() {
	var self = this;
	setTimeout(function(){
					self.queue = _.concat(self.cmdToRespond,self.queue);
					self.nextCmd();
				},self.moduleConfig.failedDelay);
}

ObdOutput.prototype.initQueue = function() {
	var self = this;
	this.on("sendCmd", function() {
		if (self.cmdInProgress == true) {
           console.info("obd.module.processQueue: awaitingReply!");
           return;
        }
        if (self.queue.length > 0 && self.ready) {
        	self.cmdInProgress = true;
        	self.cmdToRespond = self.queue[0];
            try {
                self.serial.write(self.queue.shift() + "\r");
            } catch (err) {
                console.error(err);
            }
        }
	});
}
ObdOutput.prototype.sendInitCmds = function() {
	var self = this;
	if (this.serial && this.ready) {
		//restart ELM
		this.sendCmd("ATZ");
		//turns off echo
  		this.sendCmd("ATE0");
  		//no newline
  		this.sendCmd("ATL0");
  		//dunno about this
  		// this.sendCmd("ATS0");
  		//header and checksum off, probably not wise
        this.sendCmd("ATH0");
        //Set the protocol to automatic.
        this.sendCmd("ATST0A");
        this.sendCmd("ATSP0");
        this.sendCmd("ATAT2");
        this.sendCmd("0100");
	}
}

ObdOutput.prototype.sendCmd = function(cmd) {
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
            console.error("obd.module.sendCmd: Maximum Queue reached!");
        }
    } else {
        console.error("obd.module.sendCmd:Serial port is not ready!");
    }
}
ObdOutput.prototype.close = function() {
	var self = this;
	if (! _.isUndefined(this.serial)) {
		this.serial.close(function(err) {
			if (err) {
					console.info("OBD.source: Emmiting err on close");
					self.emit("err", err);
			}
			self.emit("end");
		});
	}
}
util.inherits(ObdOutput, EventEmitter);

module.exports = ObdOutput;
