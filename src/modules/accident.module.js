const EventEmitter = require("events");
const Writable = require('stream').Writable;
const util = require("util");
const _ = require("lodash");
"use strict";

AccidentModule = function(moduleConfig) {
    var self = this;
    this.moduleConfig = {};
    //creating module without any configuration passed
	if (_.isUndefined(moduleConfig)) {
		//space for defining default settings
		this.moduleConfig.treshold = 2;
	} else {
		//creating module with configuration
		this.moduleConfig = moduleConfig;
		this.moduleConfig.treshold = moduleConfig.treshold ? moduleConfig.treshold : 2;
		this.sosMessage = moduleConfig.sosMessage ? moduleConfig.sosMessage : "Bol som ucastnikom dopravnej nehody, moje meno je XXX, d.n.r YYY, mam taketo ochorenia/alergie a beriem tieto lieky"
		//space for safe check of said config
	}

	//data generating modul have to be able to emit data event
	EventEmitter.call(this);

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
Object.setPrototypeOf(AccidentModule.prototype, Writable.prototype);


AccidentModule.prototype.configure = function() {
	this.lastAcc = [];
	this.maxAcc = {};
	this.lastGps = [];
	//space for declaring values needed for module to work
}
AccidentModule.prototype.init = function() {
	var self = this;
	this.checkTreshold = function() {
		var last = _.last(self.lastAcc);
		if (_.isEmpty(self.lastAcc)) {
			return;
		}
		if (_.isEmpty(self.maxAcc)) {
			self.maxAcc = last;
			return;
		}
		_.forIn(last, function(lastValue, key) {
			if (self.maxAcc[key] < lastValue) {
				self.maxAcc[key] = lastValue;
			}
			if (lastValue > self.moduleConfig.treshold) {
				self.send({"gforce": self.maxAcc, "gps": self.lastGps, "acc":self.lastAcc});
				self.maxAcc = {};
			}
		});
	}
	this.pushData = function(type, data) {
		if (type == "acc") {
			try {
				self.lastAcc .push(data);
				if (self.lastAcc.length > 2) {
					self.lastAcc.shift();
				}
			} catch(err) {
				console.error(err);
			}
		} else if (type == "gps") {
			try {
				self.lastGps.push(_.pick(data, ["lat", "lon"]));
				if (self.lastGps.length > 2) {
					self.lastGps.shift();
				}
			} catch(err) {
				console.error(err);
			}
		}
	}
	//initializing module, space for creating connections, opening serial ports, etc
}
AccidentModule.prototype.send = function (data,cb) {
	//if module is accepting data, this function is primarily to send data to defined destination in module
	this.emit('data',{'sosMsg':this.moduleConfig.sosMessage, 'info':data});
}
AccidentModule.prototype._write = function(chunk, encoding, cb) {
	//write method of Writable stream, if stream is in object mode,
	//we can ingore encoding and send object directly, usually nothing else needed here.
	this.pushData(chunk.header.type,chunk.body);
	this.checkTreshold();
	cb();
}
AccidentModule.prototype.close = function (cb) {
	this.lastAcc.length = 0;
	this.lastGps.length = 0;
	//function for ending module correctly, function will be called when nodejs will receive end.
}

var exports = module.exports = AccidentModule;
