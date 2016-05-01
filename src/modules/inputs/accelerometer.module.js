'use strict';
const EventEmitter = require('events');
const util = require('util');
const Accelerometer = require('./lsm303/accelerometer.js');

function AccelerometerModule(config) {
 EventEmitter.call(this);
 var self = this;
 if (typeof config !== undefined) {
    if (typeof config.sampleRate !== undefined) {
        this.sampleRate = config.sampleRate;
    } else {
            this.sampleRate = 1000; //DEFAULT VALUE
        }
    }
}
AccelerometerModule.prototype.init = function () {
    this.accel = new Accelerometer(config.accelerometerOptions);
    this.accel.init();
}
AccelerometerModule.prototype.readStop = function() {
    if (typeof this.intervalis !== 'undefined') {
        clearInterval(this.intervalis)
    }
}
AccelerometerModule.prototype.readStart = function() {
	console.log("Starting emitting accelerometer data");
	self.emitting = true;
	// console.log(this);
	self.emitLoop();
}

AccelerometerModule.prototype.emitLoop = function () {
    var self = this;
    if (typeof this.intervalis !== 'undefined') {
        clearInterval(this.intervalis)
    }
    this.intervalis = setInterval(function() {
        if (self.emitting) {
           self.accel.read(function(result) {
               self.emit('data',result);
           });
            //self.emitLoop();
        }
        else {
            return;
        }
    }, self.sampleRate);
}
AccelerometerModule.prototype.configure = function (config) {
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
AccelerometerModule.prototype.close = function() {
    this.readStop();
    this.emit('data',null);
}
util.inherits(AccelerometerModule, EventEmitter);
module.exports = AccelerometerModule;
