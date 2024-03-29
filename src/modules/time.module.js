// module which simulatesretrieving data
// from sensoric input through Date()
// this is not interface yet but getting there
// module incorporates readStart and readStop to start or stop
// retrieving data, which simulates ability to configure input modules
// right know we can stop/start retreving and set initial sampleRate
// TODO: create API for configuring properly, make abstract interface which
// every input module will inherit.
'use strict';
const EventEmitter = require('events');
const util = require('util');

function timeEmitter(config) {
  	EventEmitter.call(this);
    console.log(config);
  	var self = this;
    if (typeof config !== undefined) {
        if (typeof config.sampleRate !== undefined) {
            this.sampleRate = config.sampleRate;
        } else {
            this.sampleRate = 1000; //DEFAULT HODNOTA
        }
    }
}
timeEmitter.prototype.init = function () {
    var self = this;
}
timeEmitter.prototype.readStop = function() {
    if (typeof this.intervalis !== 'undefined') {
        clearInterval(this.intervalis);
        this.emitting = false;
    }
}

timeEmitter.prototype.readStart = function() {
	this.emitting = true;
	// console.log(this);
	this.emitLoop();
}

timeEmitter.prototype.emitLoop = function () {
    var self = this;
    if (typeof this.intervalis !== 'undefined') {
        clearInterval(this.intervalis)
    }
    this.intervalis = setInterval(function() {
        if (self.emitting) {
            var d = new Date()
            self.emit('data', d.toJSON());
            self.emitLoop();
        }
        else {
            return;
        }
    }, this.sampleRate);
}
timeEmitter.prototype.configure = function (config) {
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
timeEmitter.prototype.close = function (cb) {
    this.emit('data',null);
    this.readStop();
}

util.inherits(timeEmitter, EventEmitter);


// const myEmitter = new timeEmitter(1000);
// myEmitter.on('data', (chunk) => {
//   console.log('an event occurred!' + chunk);
// });
// uncoment this and you can see readStart/Stop in action,
// use node time.js
// myEmitter.readStart();
// setTimeout(function() {
// 	myEmitter.readStop();
// 	setTimeout(function() {
// 		myEmitter.readStart();
// 	}, 5000);
// }, 5300);


module.exports = timeEmitter;
