const inputStream = require('./inputStreamWrapper.js');
const _ = require('lodash');


function DataLogger (configJSON) {
	var self = this;
	this.modules = {}
	if (typeof configJSON !== 'undefined') {
		this.configure(configJSON)
		console.log(this.inputs);

	}
	else {
		// TODO: configure with default settings
	}
}
DataLogger.prototype.configure = function (configJSON) {
	var self = this;
	// console.log(configJSON);
	if (_.isUndefined(configJSON)) {
		return
	}
	if (!_.isUndefined(configJSON.modules)) {
		for (var index = 0; index < configJSON.modules.length; index++) {
			this.addModule(configJSON.modules[index], function (err) {
				if (err) {
					console.error(err);
				}
			});
		}
	} else {
		console.error("DataLogger.configure: No modules defined in config.json");
	}
	if (!_.isUndefined(configJSON.routes)) {
		_.forOwn(configJSON.modules, function(key,value) {
			self.addRoute(key,value);
		})
	}
}
DataLogger.prototype.addModule = function (config) {
	var self = this;
	if (_.isUndefined(config.modulePath)) {
		console.error("DataLogger.addModule: modulePath is not defined for ["+config.name+"]");
		return;
	}
	try {
		var module = require("../" + config.modulePath);
	} catch(err) {
		console.error(err);
		return;
	}
	//vytvorym stream
	inputConfig.stream = new inputStream(inputConfig.module,inputConfig);
}
DataLogger.prototype.addRoute = function (source, sink) {
	var self = this;

	try {
		//nacitam modul
		inputConfig.module = require("../" + inputConfig.modulePath);
	} catch(err) {
		console.error(err);
		return;
	}
	//pripojim event na kazdy output source.
	inputConfig.stream.on('readable', function() {
		if (!isDefined(inputConfig.outputs) || inputConfig.outputs.length == 0) {
			inputConfig.stream.pause(); //zastavujem citanie
		}
		var readObject = inputConfig.stream.read();
		if (isDefined(inputConfig.transfromStream)) {
			// ked chceme prekladat data
			return;
		} else {
			// ak nie tak ich rovno posielame podla configu
			for (var outputIndex = 0; outputIndex < inputConfig.outputs.length; outputIndex++) {
				if (!isDefined(self.outputs[inputConfig.outputs[outputIndex]])) {
					console.error("DataLogger.configure.inputConfig["+inputConfig.name+"] has output source which is not defined");
				} else {
					self.outputs[inputConfig.outputs[outputIndex]].module.send(readObject);
				}
			}
		}
	});
	//nakoniec pridam do interneho zoznamu data-loggera.
	self.inputs[inputConfig.name] = inputConfig;
}
DataLogger.prototype.removeInputSource = function (inputSourceName) {
	var self = this;
	if (!isDefined(self.inputs[inputSourceName])) {
		console.warn("Input with that name does not exists.");
		return;
	}
	try {
		self.inputs[inputSourceName].stream.removeListener('readable', function () {
			console.log(inputSourceName + " successfully removed listener.");
		});
		delete self.inputs[inputSourceName];
	} catch (err) {
		console.error(err);
	}
}
DataLogger.prototype.addOutputSink = function(outputConfig) {
	var self = this;
	if (isDefined(self.outputs[outputConfig.name])) {
		console.error("Output with that name already exists, please remove it first.");
		return;
	}
	try {
		//ziskam module
		outputConfig.module = require("../" + outputConfig.modulePath);
		//inicializujem
		outputConfig.module.init(outputConfig);
		//pridam do interneho zoznamu data-loggeraloggeraloggera
		self.outputs[outputConfig.name] = outputConfig;
		//console.log(self.outputs);
	} catch (err) {
		console.error(err);
	}
}
DataLogger.prototype.removeOutputSink = function (outputSinkName) {
	var self = this;
	if (!isDefined(self.outputs[outputSinkName])) {
		console.warn("Input with that name does not exists.");
		return;
	}
	try {
		//zavolam funkciu na korektne ukoncenie output modulu
		self.outputs[outputSinkName].module.close();
		//vymazem property z internej pamete data loggera
		delete self.outputs[outputSinkName];
	} catch (err) {
		console.error(err);
	}
}
DataLogger.prototype.configureInputSource = function (inputSourceName, inputConfigJSON) {
	var self = this;
	if (!isDefined(self.inputs[inputSourceName])) {
		console.error("data-logger.module.js: configureInputSource:: Input with name ["+inputSourceName+"] does not exists");
		return;
	}
	self.inputs[inputSourceName].stream.write(inputConfigJSON);
}
DataLogger.prototype.configureOutputSink = function (outputSinkName, outputConfigJSON) {
	var self = this;
	if (!isDefined(self.outputs[outputSinkName])) {
		console.error("data-logger.module.js: configureOutputSink:: Output with name ["+outputSinkName+"] does not exists");
		return;
	}
	self.outputs[outputSinkName].module.configure(outputConfigJSON);
}
DataLogger.prototype.shutdown = function() {
    console.info("DataLogger shutting down!")
    for (var inputKey in this.inputs) {
        if (!this.inputs.hasOwnProperty(inputKey)) {
             continue
        }
        console.log("Closing Input: ", this.inputs[inputKey].name);
        this.removeInputSource(inputKey);
    }
    for (var outputKey in this.outputs) {
        if (!this.outputs.hasOwnProperty(outputKey)) {
             continue
        }
        console.log("Closing Output: ", this.outputs[outputKey].name);
        this.removeOutputSink(outputKey);
    }
    process.exit();
}
DataLogger.prototype.addTransportStream = function (transportConfig){
	var self = this;
	if (isDefined(this.transports[transportConfig.name])) {
		console.error("Transport strean with that name already exists, please remove it first.");
		return;
	}
	try {
		//nacitam modul
		transportConfig.module = require("../" + transportConfig.modulePath);
	} catch (err) {
		console.error(err);
	}
	//vytvorym stream
	transportConfig.module.init(function (err) {
		if (err) {
			console.error(err);
		}
	});
	try {
		this.transports.push(transportConfig);
	} catch (err) {
		console.error(err);
	}
}
module.exports = new DataLogger();
