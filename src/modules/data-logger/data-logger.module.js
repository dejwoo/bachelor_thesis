const inputStream = require('./inputStreamWrapper.js');

function DataLogger (configJSON) {
	var self = this;
	this.inputs = {};
	this.outputs = {};
	if (typeof configJSON !== 'undefined') {
		this.configure(configJSON)
		console.log(this.inputs);

	}
	else {
		// TODO: configure with default settings
	}
}
function isDefined(object) {
	if (typeof object === 'undefined') {
		return false;
	}
	return true;
}
DataLogger.prototype.configure = function (configJSON) {
	console.log(configJSON);
	if (!isDefined(configJSON)) {
		return
	}
	if (isDefined(configJSON.outputs)) {
		for (var index = 0; index < configJSON.outputs.length; index++) {
			var outputConfig = configJSON.outputs[index];
			this.addOutputSource(outputConfig);
		}
	}
	if (isDefined(configJSON.inputs)) {
		for (var index = 0; index < configJSON.inputs.length; index++) {
			var inputConfig = configJSON.inputs[index];
			this.addInputSource(inputConfig);
		}
	}
}
DataLogger.prototype.addInputSource = function (inputConfig) {
	var self = this;
	if (isDefined(this.inputs[inputConfig.name])) {
		console.error("Input with that name already exists, please remove it first.");
		return;
	}
	try {
		//nacitam modul
		//todo vyriesit folder strukturu
		inputConfig.module = require("../" + inputConfig.modulePath);
		//vytvorym stream
		inputConfig.stream = new inputStream(inputConfig.module,inputConfig.sourceOptions);
		//pripojim event na kazdy output source.
		inputConfig.stream.on('readable', function() {
			var readObject = inputConfig.stream.read();
			process.stdout.write(inputConfig.name + ": ");
			console.log(readObject);
			if (isDefined(inputConfig.transfromStream)) {
				// ked chceme prekladat data
				return;
			} else {
				// ak nie tak ich rovno posielame podla configu
				for (var outputIndex = 0; outputIndex < inputConfig.outputs.length; outputIndex++) {
					if (!isDefined(self.outputs[inputConfig.outputs[outputIndex]])) {
						console.error("DataLogger.configure.inputConfig["+inputConfig.name+"] has output source which is not defined");
					} else {
						self.outputs[inputConfig.outputs[outputIndex]].module.send(readObject, inputConfig);
					}
				}
			}
		});
		//nakoniec pridam do interneho zoznamu data-loggera.
		self.inputs[inputConfig.name] = inputConfig;

	} catch(err) {
		//nastala chyba v try blocku, vypisem spravu
		console.error(err);
	}
}
DataLogger.prototype.removeInputSource = function (inputSourceName) {
	var self = this;
	if (!isDefined(self.inputs[inputSourceName])) {
		console.warn("Input with that name does not exists.");
		return;
	}
	try {
		self.input[inputSourceName].stream.removeListener('readable', () => {
			console.log(inptuSourceName + " successfully removed listener.");
		});
		//vymazem property z internej pamete data loggera
		delete self.inputs[inputSourceName];
	} catch (err) {
		console.error(err);
	}
}
DataLogger.prototype.addOutputSource = function(outputConfig) {
	var self = this;
	if (isDefined(self.outputs[outputConfig.name])) {
		console.error("Output with that name already exists, please remove it first.");
		return;
	}
	try {
		//ziskam module
		outputConfig.module = require("../" + outputConfig.modulePath);
		//inicializujem
		outputConfig.module.init(outputConfig.sourceOptions);
		//pridam do interneho zoznamu data-loggera
		self.outputs[outputConfig.name] = outputConfig;
	} catch (err) {
		console.error(err);
	}
}
DataLogger.prototype.removeOutputSource = function (outputSourceName) {
	var self = this;
	if (!isDefined(self.outputs[outputSourceName])) {
		console.warn("Input with that name does not exists.");
		return;
	}
	try {
		//zavolam funkciu na korektne ukoncenie output modulu
		self.outputs[outputSourceName].module.close();
		//vymazem property z internej pamete data loggera
		delete self.outputs[outputSourceName];
	} catch (err) {
		console.error(err);
	}
}
DataLogger.prototype.configureInputSource = function (inputSourceName, inputConfigJSON) {
	var self = this;
	if (!isDefined(self.inputs[inputSourceName])) {
		console.error("data-logger.module.js: configureInputSource:: Input with name ["+inputSourceName+"] does not exists");
	}
	self.inputs[inputSourceName].stream.write(inputConfigJSON);
}
module.exports = new DataLogger();