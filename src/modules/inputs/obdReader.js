const EventEmitter = require('events');
const util = require('util');
const serialport = require('serialport')
const SerialPort = serialport.SerialPort;
const PIDs = require('./obdPidList.js');


function ObdReaderInputSource(options) {
	EventEmitter.call(this);
	var self = this;
    self.options = {};
    if (typeof options === 'undefined') {
		self.options.device = "/dev/ttyACM0"
		self.options.sampleRate = 1000;
	} else {
		//got config device
		if (typeof options.device !== 'undefined') {
			self.options.device = options.device
		// did receive config, but no device specified.
		} else {
			self.options.device = "/dev/ttyACM0"
		}
	}
	self.init()
}
ObdReaderInputSource.prototype.init = function(hotstart) {
	var self = this;
	if (!hotstart) { // aby sme nestratili prikazy pri neuspesnom starte
		self.pidQueue = []; //fronta PID dotazov pred inicializaciou portu
	}
	self.responseQueue = []; //fronta, FIFO pre spojenie prikazu a odpovede
	self.multiLineResponse = 0; //v pripade viac riadkovych odpovedi, musime vediet ze partia pod jeden prikaz
	self.emitOuput = {}; //objekt v kt. zbieram udaje na poslanie z modulu
	self.multiLineArray = []; //pole v kt. drzim viac riadkove odpovede
	self.serial = new SerialPort(self.options.device, {
		baudrate:115200,
		parser: serialport.parsers.readline('\r\n')
	});
	self.ready = false;
	self.serial.on('open', function () {
		console.log("OBD.source: Serial Port ready")
  		//reset device
  		setTimeout(function(){
  			self.serial.write('ATZ\r\n');
  		  	//turn off echo
  		  	self.serial.write('ATE0\r\n');
  		  	self.serial.write('0100\r\n');
  		  	self.responseQueue.push(PIDs["01_pid_support"]);
  		  	// self.ready = true;
  		  	//add eventlistener on data
  		  	self.registerDataListener();}, 500); //kvoli doinicializacie portu
    });




}
ObdReaderInputSource.prototype.registerDataListener = function() {
	var self = this;
	self.serial.on('data', function (result,err) {

		if (self.ready === false) {
			self.ready = true;
			self.executePidsInQueue();
		}

		if (result.substr(0,1) === '>') {
			result = result.substr(1);
		}
		if (err) {
			console.error(err);
		}
		if (self.responseQueue.length == 0) {
			console.log("RESULT ARRAY:",result.split(' '));
			console.log(result.length, typeof result, result);
			console.error("No PID object queued, result");
		} else {

			// if (self.multiLineResponse) {
				//pripad viac packetovej odpovede
				// var dataObject = self.responseQueue[0];
				// self.multiLineResponse--;
				// self.multiLineArray.push(result.split(' '));

				// if (self.multiLineResponse == 0) {
				// 	self.parseOBDresponse(dataObject ,self.multiLineResponse); // odoslem prvok na spracovanie
				// 	self.responseQueue.shift(); //posuvam frontu na dalsi pid signal;
				// }
			// } else {
				var dataObject = self.responseQueue.shift();
				// console.log(self.multiLineResponse);
				// if (Math.floor(self.dataObject.bytes/4) > 1 ) {
					// self.multiLineResponse = Math.floor(self.dataObject.bytes/4) -1; //jeden nam prave prisiel
					// self.multiLineArray.push(result.split(' '));

				// } else {
					var output = result.split(' ');
					// console.log(dataObject.mode + dataObject.pid, dataObject.name, result.split(' '), dataObject.unit);
					if (output[0] == '41' && output[1] == '00') {
						console.log("OBD.source: Setting automatic polling of supported PIDs");
						// prvy pid je support kt. je povinny nemusime ho pollovat
						self.pidsToRead = self.setSupportedPids(dataObject.convert(result.split(' '))).slice(1);
					}

					var dataObject = self.responseQueue[0];
				// self.multiLineResponse--;
				// self.multiLineArray.push(result.split(' '));

				// if (self.multiLineResponse == 0) {
				// 	self.parseOBDresponse(dataObject ,self.multiLineResponse); // odoslem prvok na spracovanie
				// 	self.responseQueue.shift(); //posuvam frontu na dalsi pid signal;
				// }}
					// else {
						self.parseOBDresponse(dataObject ,result.split(' '));
					// }
				// }
			}

		// }

	});
}
ObdReaderInputSource.prototype.parseOBDresponse = function (dataObject,bytes) {

	var cmd = bytes[0] + bytes[1];
	switch (cmd) {
		case "NODATA":
			self.emitOuput[dataObject.name] =  {"name"	   : dataObject.name,
												"header": [dataObject.mode,dataObject.pid],
												"response:" : "NO DATA"};

		default:
			self.emitOuput[dataObject.name] =  {"name"	   : dataObject.name,
										   "header"   : bytes.slice(0,2),
										   "response" : dataObject.convert(bytes.slice(2)),
											"units"	   : dataObject.unit };
	}
	if (dataObject.name === self.pidsToRead[self.pidsToRead.length-1]) { // ak sa meno rovna poslednemu prvku v iteracii mozme emitnut cely objekt.
		self.emit('data',self.emitOutput);
		self.emitOutput = {};
	}

}
ObdReaderInputSource.prototype.setSupportedPids = function (supportedBinaryString) {
	//These names are in order of binnary support encoding returned from OBD.
	// First 20, and are subjected to automatic polling of this module.

	// 01_pid_support dtc_cnt dtcfrzf fuelsys load_pct temp shrtft13 longft13
	// shrtft24 longft24 frp map rpm vss sparkadv iat maf throttlepos air_stat
	// o2sloc o2s11 o2s12 o2s13 o2s14 o2s21 o2s22 o2s23 o2s24 obdsup o2sloc2
	// pto_stat runtm piddsupp2
	var allPidNames = ["01_pid_support", "dtc_cnt", "dtcfrzf", "fuelsys", "load_pct", "temp", "shrtft13", "longft13",
	"shrtft24", "longft24", "frp", "map", "rpm", "vss", "sparkadv", "iat", "maf", "throttlepos", "air_stat",
	"o2sloc", "o2s11", "o2s12", "o2s13", "o2s14", "o2s21", "o2s22", "o2s23", "o2s24", "obdsup", "o2sloc2",
	"pto_stat", "runtm", "piddsupp2"];
	var supportedPidNames = [];
	for (var index = 0; index < supportedBinaryString.length; index++) {
		if (supportedBinaryString[index] == 1) {
			supportedPidNames.push(allPidNames[index]);
		}
	}
	console.log("OBD.source: Supported PIDs are",supportedPidNames);
	return supportedPidNames;
}
ObdReaderInputSource.prototype.readStart = function() {
	//automatic polling of all supported cmds
	var self = this;
	if (self.emitting == true) {
		return;
	}
	console.log("OBD.source: Starting sending data!");
	self.emitting = true;
	self.emitLoop();
	if (typeof self.serial === 'undefined') {
		console.error("OBD.source: Something wrong with creating serial port.");
	}
}
ObdReaderInputSource.prototype.emitLoop = function() {
	var self = this;
	self.intervalis = setInterval(function() {
		console.log(self.ready);
		if (self.ready == true) {
			if (typeof self.pidsToRead !== 'undefined') {
				for (var index = 0; index < self.pidsToRead.length; index++) {
					self.getPid(self.pidsToRead[index]);
				}
			}
		}
	},self.options.sampleRate);
}

ObdReaderInputSource.prototype.getPid = function(pidName) {
	var self = this;
	if (self.ready === false) {
		self.pidQueue.push(pidName);
		return;
	}
	var pidObject = PIDs[pidName];
	if (typeof pidObject === "undefined") {
		console.error("OBD.source.getPID: Undefined PID");
	} else {
		//cmd is buffer or an array of bytes or a string e.g. type that Buffer constructor accepts
		var cmd = pidObject.mode + pidObject.pid + '\r\n';
		self.serial.write(cmd, function(err, bytesWritten) {
			if (err) {
				console.error(err);
			}
			if (bytesWritten === cmd.length) {
				self.responseQueue.push(pidObject);
			}
		});
	}
}

ObdReaderInputSource.prototype.executePidsInQueue = function () {
	var self = this;
	for (var index = 0; index < self.pidQueue.length; index++) {
		self.getPid(self.pidQueue[index]);
	}
	console.log(self.pidQueue);
	self.pidQueue = [];
}

ObdReaderInputSource.prototype.readStop = function() {
	var self = this;
	if (self.emitting == false) {
		return;
	}
	if (typeof self.intervalis !== 'undefined') {
		clearInterval(self.intervalis);
	}
	self.serial.close(function(err) {
		if (err) {
				console.info('OBD.source: Emmiting err on close');
				self.emit('err', err);
		}
		self.emit('end');
	});
	console.log("OBD.source: Stopped sending data!");
}
util.inherits(ObdReaderInputSource, EventEmitter);

// module.exports = new ObdReader;
var obd = new ObdReaderInputSource();
obd.readStart();
// obd.getPid("vin");




