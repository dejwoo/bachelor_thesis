'use strict';
const EventEmitter = require('events');
const util = require('util');
const accelerometer = require('./lsm303/accelerometer.js');

function accelEmmiter(config) {
  	EventEmitter.call(this);
  	var self = this;
  	this.accel = new accelerometer(config.accelerometerOptions);
	this.accel.init();
    if (typeof config !== undefined) {
        if (typeof config.sampleRate !== undefined) {
            this.sampleRate = config.sampleRate;
        } else {
            this.sampleRate = 1000; //DEFAULT VALUE
        }
    }
	this.readStop = function() {
		console.log("Stoping emitting accelerometer data");
        if (typeof this.intervalis !== 'undefined') {
            clearInterval(this.intervalis)
        }
    }
	this.readStart = function() {
		console.log("Starting emitting accelerometer data");
		self.emitting = true;
		// console.log(this);
		self.emitLoop();
	}
	// console.log(self);
}
accelEmmiter.prototype.emitLoop = function () {
    var self = this;
    if (typeof this.intervalis !== 'undefined') {
        clearInterval(this.intervalis)
    }
    this.intervalis = setInterval(function() {
        if (self.emitting) {
	    self.accel.read(function(result) {
	   	self.emit('data',result);
	    });
            self.emitLoop();
        }
        else {
            return;
        }
    }, self.sampleRate);
}
accelEmmiter.prototype.configure = function (config) {
    console.info("Configuring timeInput config: " + config);
    if (typeof config !== undefined) {
        if (typeof config.sampleRate !== undefined) {
            this.sampleRate = config.sampleRate;
        } else {
            this.sampleRate = 1000; //DEFAULT HODNOTA
        }
    }
    if (typeof this.intervalis !== 'undefined') {
        this.emitLoop();
    }
}
util.inherits(accelEmmiter, EventEmitter);
module.exports = accelEmmiter;
