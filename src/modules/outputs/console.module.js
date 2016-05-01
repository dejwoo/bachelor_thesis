const Writable = require('stream').Writable;
const util = require('util');
const _ = require('lodash');

function ConsoleOutput (config) {
	var self = this;
	if (_.isUndefined(config)) {
  		console.error("console.module.js: Undefined config!");
  	}
	this.config = config;
}

util.inherits(ConsoleOutput, Writable);

ConsoleOutput.prototype.init = function () {
	var self = this;
	if (_.isUndefined(this.config.streamOptions)) {
		var streamOptions = {};
	} else {
		var streamOptions = this.config.streamOptions;
	}
  //this settings must be always set to this value
  streamOptions.objectMode = true;
  Writable.call(this, streamOptions);
  console.log("console.module.js: Module initialized!");
}
ConsoleOutput.prototype.close = function (callback) {
	if (! _.isUndefined(callback)) {
		console.log("console.module.js: Closing module!");
		callback();
	}
	return;
}
ConsoleOutput.prototype.send = function (data,callback) {
	console.log(this.config.messageHeader + " | " + data.header.id);
	console.log(data.body);
}
ConsoleOutput.prototype._write = function(chunk, encoding, cb) {
	//ConsoleOutput writable stream is in object mode we can igonore encoding;
	this.send(chunk);
	cb();
}
module.exports = ConsoleOutput;
