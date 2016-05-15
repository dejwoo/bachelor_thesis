const EventEmitter = require("events");
const Writable = require('stream').Writable;
const util = require("util");
const _ = require("lodash");
const request = require("request");

"use strict";

iftttModule = function(moduleConfig) {
	var self = this;
    this.moduleConfig = {};
    //creating module without any configuration passed
	if (_.isUndefined(moduleConfig)) {
		//space for defining default settings
		this.moduleConfig.firstPartUrl = "https://maker.ifttt.com/trigger/";
		this.moduleConfig.secondPartUrl = "/with/key/bbBvwBTGf4XLxL2NkP8Eid";
	} else {
		//creating module with configuration
		this.moduleConfig = moduleConfig;
		this.moduleConfig.firstPartUrl = this.moduleConfig.firstPartUrl ?  moduleConfig.firstPartUrl : "https://maker.ifttt.com/trigger/";
		this.moduleConfig.secondPartUrl = this.moduleConfig.secondPartUrl ?  moduleConfig.secondPartUrl : "/with/key/bbBvwBTGf4XLxL2NkP8Eid";
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
Object.setPrototypeOf(iftttModule.prototype, Writable.prototype);


iftttModule.prototype.configure = function() {
	//space for declaring values needed for module to work
}
iftttModule.prototype.init = function() {
	//initializing module, space for creating connections, opening serial ports, etc
}
iftttModule.prototype.send = function (data,cb) {
	//if module is accepting data, this function is primarily to send data to defined destination in module
	var iftttUrl = "";
	iftttUrl += this.moduleConfig.firstPartUrl;
	if (_.isUndefined(data.header.iftttEvent)) {
		iftttUrl += data.header.id;
	} else {
		iftttUrl += data.header.iftttEvent;
	}
	iftttUrl += this.moduleConfig.secondPartUrl;
	//transorm of keys in data packet cuz of IFTTT dumbness
	var outputData ={};
	outputData.value1 = data.header;
	outputData.value2 = data.body;
	console.log(outputData);
	require('request').debug = true
	request.post(iftttUrl,{form:outputData}, function(error, msg, response){
		// console.log("ERROR", error);
		 // console.log("MSG", msg);
		 console.log("RESPONSE", response);
	});
}
iftttModule.prototype._write = function(chunk, encoding, cb) {
	//write method of Writable stream, if stream is in object mode,
	//we can ingore encoding and send object directly, usually nothing else needed here.
	this.send(chunk);
	cb();
}
iftttModule.prototype.close = function (cb) {
	//function for ending module correctly, function will be called when nodejs will receive end.
}

var exports = module.exports = iftttModule;