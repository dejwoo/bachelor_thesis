const util = require('util');
const Duplex = require('stream').Duplex;
const _ = require("lodash");
util.inherits(inputStreamWrapper, Duplex);


function inputStreamWrapper(source, config) {
	this.config = config;
	this._source = source;
	this.init();
}
inputStreamWrapper.prototype.init = function() {
	var self = this;
	if (_.isUndefined(this.config.streamOptions)) {
		var streamOptions = {};
	} else {
		var streamOptions = this.config.streamOptions;
	}
  //this settings must be always set to this value
  streamOptions.readableObjectMode = true;
  streamOptions.writableObjectMode = true;
  Duplex.call(this, streamOptions);
  this._isReading = false;
  this.addEventListeners();
}
inputStreamWrapper.prototype.addEventListeners = function () {
	var self = this;
  // Every time there's data, we push it into the internal buffer.
  this._source.on('data', function(chunk) {
	// if push() returns false, then we need to stop reading from source
	var emitObject = {};
	if (_.isUndefined(self.config.header)) {
		emitObject.header = {};
		emitObject.header.id = self.config.id;
	} else {
		emitObject.header = self.config.header;
		if (!isDefined(emitObject.header.id)) {
			emitObject.header.id = self.config.id;
      emitObject.header.type = self.config.type;
		}
	}
	emitObject.body = chunk;
	if (!self.push(emitObject)) {
		self._source.readStop();
		self._isReading = false;
	}
});
  // When the source ends, we push the EOF-signaling `null` chunk
  this._source.on('end', function() {
  	self.push(null);
  });
  this._source.on('configured', function(response,err) {
  	if (err) {
  		console.info("Config error of " + self._source.name + ": " + response );
  	}
  	console.info("Config response of " + self._source.name + ": " + response );
  });
}
// _read will be called when the stream wants to pull more data in
// the advisory size argument is ignored in this case.
inputStreamWrapper.prototype._read = function(size) {
	if (!this._isReading) {
		if (! _.isUndefined(this._source.readStart)) {
			this._source.readStart();
		}
		this._isReading = true;
	}
};
inputStreamWrapper.prototype._write = function(data, encoding, callback) {
	if (typeof this._source.configure === 'undefined') {
		if (typeof callback !== "undefined") {
			callback("inputStreamWrapper.write: Source does not implement configure!");
		} else {
			console.error("inputStreamWrapper.write: Source does not implement configure!");
		}
	}
	console.log("Configuring", data);
	this._source.configure(data);
	if (typeof callback !== "undefined") {
		callback();
	}
};
inputStreamWrapper.prototype.close = function() {
	if (! _.isUndefined(this._source.readStop)) {
		this._source.readStop();
	}
	if (! _.isUndefined(this._source.close)) {
		this._source.close();
	}
	this._isReading = false;
	this.push(null)
}
var exports = module.exports = inputStreamWrapper
