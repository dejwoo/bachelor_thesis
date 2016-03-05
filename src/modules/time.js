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

function timeEmitter(sampleRate) {
  	EventEmitter.call(this);
  	let self = this;
  	this.reading = false;
  	this.sampleRate = sampleRate;
  	this.loop = function() {
		setTimeout(function() {
			if (self.reading) {
				self.emit('data', Date());
				self.loop();
			}
			else {
				return;
			}
		}, self.sampleRate);
	}

	this.readStop = function() {
		self.reading = false;
	}
	this.readStart = function() {
		self.reading = true;
		// console.log(this);
		self.loop();

	}
	console.log(self);
}
util.inherits(timeEmitter, EventEmitter);


const myEmitter = new timeEmitter(1000);
myEmitter.on('data', (chunk) => {
  console.log('an event occurred!' + chunk);
});
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