const Writable = require('stream').Writable;
const util = require('util');
const _ = require('lodash');

function ConsoleOutput (moduleConfig) {
	var self = this;
	if (_.isUndefined(moduleConfig)) {
  		console.error("console.module.js: Undefined moduleConfig!");
  	}
	this.moduleConfig = moduleConfig;
}

util.inherits(ConsoleOutput, Writable);

ConsoleOutput.prototype.init = function () {
	var self = this;
	console.log(this.moduleConfig);
	if (_.isUndefined(this.moduleConfig.streamOptions)) {
		var streamOptions = {};
	} else {
		var streamOptions = this.moduleConfig.streamOptions;
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
	console.log(this.moduleConfig.messageHeader + " | " + data.header.id);
	console.log(data.body);
}
ConsoleOutput.prototype._write = function(chunk, encoding, cb) {
	//ConsoleOutput writable stream is in object mode we can igonore encoding;
	this.send(chunk);
	cb();
}
module.exports = ConsoleOutput;
