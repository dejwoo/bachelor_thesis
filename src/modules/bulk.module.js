const EventEmitter = require("events");
const Writable = require('stream').Writable;
const util = require("util");
const _ = require("lodash");
const sizeof = require('object-sizeof');
"use strict";

BulkModule = function(moduleConfig) {
	var self = this;
	this.moduleConfig = {};
    //creating module without any configuration passed
    if (_.isUndefined(moduleConfig)) {
		//space for defining default settings
		this.moduleConfig.timePassed = 5000;
		this.moduleConfig.payloadSize = 300; //kB
	} else {
		//creating module with configuration
		this.moduleConfig = moduleConfig;
		this.moduleConfig.timePassed = moduleConfig.timePassed ? moduleConfig.timePassed : 5000;
		this.moduleConfig.payloadSize = moduleConfig.payloadSize ? moduleConfig.payloadSize : 300;
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

util.inherits(BulkModule, Writable);
util.inherits(BulkModule, EventEmitter);

BulkModule.prototype.configure = function() {
	this.outputMessage = [];
  	this.outputSize = 0;
  	this.timeNow = Date.now();
	//space for declaring values needed for module to work
}
BulkModule.prototype.init = function() {
	//initializing module, space for creating connections, opening serial ports, etc
	this.checkConditions = function() {
		if (Date.now() - this.timeNow > this.moduleConfig.timePassed || this.outputSize > this.moduleConfig.payloadSize) {
			this.send();
			this.resetCounter();
		}
	}
	this.resetCounter = function() {
		this.outputMessage = [];
		this.outputSize = 0;
		this.timeNow = Date.now();
	}
}
BulkModule.prototype.send = function (cb) {
	self.emit('data', this.outputMessage);
	if (cb) {
		cb();
	}
	//if module is accepting data, this function is primarily to send data to defined destination in module
}
BulkModule.prototype._write = function(chunk, encoding, cb) {
	//write method of Writable stream, if stream is in object mode,
	//we can ingore encoding and send object directly, usually nothing else needed here.
	try {
		this.outputMessage.push(chunk);
	} catch(err) {
		console.error(err);
	}
	this.outputSize += sizeof(chunk);
	this.checkConditions();
	cb();
}
BulkModule.prototype.close = function (cb) {
	//function for ending module correctly, function will be called when nodejs will receive end.
	this.send();
	this.resetCounter();
}