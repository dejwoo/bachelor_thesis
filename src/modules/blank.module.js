const EventEmitter = require("events");
const Writable = require('stream').Writable;
const util = require("util");
const _ = require("lodash");
"use strict";

BlankModule = function(moduleConfig) {
	var self = this;
    this.moduleConfig = {};
    //creating module without any configuration passed
	if (_.isUndefined(moduleConfig)) {
		//space for defining default settings
	} else {
		//creating module with configuration
		this.moduleConfig = moduleConfig;
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
Object.setPrototypeOf(BlankModule.prototype, Writable.prototype);


BlankModule.prototype.configure = function() {
	//space for declaring values needed for module to work
}
BlankModule.prototype.init = function() {
	//initializing module, space for creating connections, opening serial ports, etc
}
BlankModule.prototype.send = function (data,cb) {
	//if module is accepting data, this function is primarily to send data to defined destination in module
}
BlankModule.prototype._write = function(chunk, encoding, cb) {
	//write method of Writable stream, if stream is in object mode,
	//we can ingore encoding and send object directly, usually nothing else needed here.
	this.send(chunk);
	cb();
}
BlankModule.prototype.close = function (cb) {
	//function for ending module correctly, function will be called when nodejs will receive end.
}

var exports = module.exports = BlankModule;