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
		this.moduleConfig.treshold = 5;
	} else {
		//creating module with configuration
		this.moduleConfig = moduleConfig;
		this.moduleConfig.treshold = moduleConfig.treshold ? moduleConfig.treshold : 5;
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
}
Object.setPrototypeOf(AccidentModule.prototype, Writable.prototype);


AccidentModule.prototype.configure = function() {
	this.lastAcc = [];
	this.maxAcc = {};
	tihs.lastGps = [];
	//space for declaring values needed for module to work
}
AccidentModule.prototype.init = function() {
	this.checkTreshold = function() {
		var last = _.last(this.lastAcc);
		if (_.isEmpty(this.maxAcc)) {
			this.maxAcc = last;
			return;
		}
		_.forIn(last, function(lastValue, key) {
			if (this.maxAcc[key] < lastVaule[key]) {
				this.maxAcc[key] = lastVaule[key];
				if (lastValue > this.moduleConfig.treshold) {
					this.send({"g-force": this.maxAcc, "gps": this.lastGps, "acc":this.lastAcc});
				}
			}
		});
	}
	this.pushData = function(type, data) {
		if (type == "acc") {
			try {
				this.lastAcc .push(data);
				if (this.lastAcc.length > 10) {
					this.lastAcc.shift();
				}
			} catch(err) {
				console.error(err);
			}
		} else if (type == "gps") {
			try {
				this.lastGps.push(data);
				if (this.lastGps.length > 10) {
					this.lastGps.shift();
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
	this.emit('data',data);
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