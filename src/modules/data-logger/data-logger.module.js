const inputStream = require('./inputStreamWrapper.js');

function DataLogger (configJSON) {
	this.inputs = {};
	this.outputs = {};
	if (typeof configJSON !== 'undefined') {
		this.configure(configJSON)
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
	if (isDefined(configJSON.inputs)) {
		for (var index = 0; index < configJSON.inputs.length; index++) {
			var inputConfig = configJSON.inputs[index];
			this.addInputSource(inputConfig);
		}
	}
}
DataLogger.prototype.addInputSource = function (inputConfig) {
	if (isDefined(this.inputs[inputConfig.name])) {
		console.error("Input with that name already exists, please remove it first.");
		return;
	}
	try {
		//nacitam modul
		//todo vyriesit folder strukturu
		inputConfig.module = require("../" + inputConfig.modulePath);
		//vytvorym stream
		inputConfig.stream = new inputStream(inputConfig.module,inputCondfig.sourceOptions);
		//pripojim event na kazdy output source.
		myTimeInputStream.on('readable', function() {
			var readObject = inputConfig.stream.read();
			process.stdout.write(inputConfig.name + ": ");
			console.log(readObject);
			if (isDefined(inputConfig.transfromStream)) {
				// ked chceme prekladat data
				continue;
			} else {
				// ak nie tak ich rovno posielame podla configu
				for (var outputIndex = 0; outputIndex < inputConfig.outputs.length) {
					if (!isDefined(this.outputs[inputConfig.outputs[outputIndex]])) {
						console.error("DataLogger.configure.inputConfig has output source which is not defined");
					}
					this.outputs[inputConfig.outputs[ouputIndex]].module.send(readObject);
				}
			}
		});
		//nakoniec pridam do interneho zoznamu data-loggera.
		this.inputs[inputConfig.name] = inputConfig;

	} catch(err) {
		//nastala chyba v try blocku, vypisem spravu
		console.error(err);
	}
}
DataLogger.prototype.removeInputSource = function (inputSourceName) {
	if (isDefined(this.inputs[inputConfig.name])) {
		console.error("Input with that name already exists, please remove it first.");
		return;
	}
	try {

	}
}
DataLogger.prototype.addOutputSource = function (outputConfig) {
	if (isDefined(this.outpus[outputConfig.name])) {
		console.error("Output with that name already exists, please remove it first.");
		return;
	}
	try {
		//ziskam module
		outputConfig.module = require("../" + outputConfig.modulePath);
		//inicializujem
		outputConfig.module.init();
		//pridam do interneho zoznamu data-loggera
		this.outputs[outputConfig.name] = outputConfig;
	}
}
module.exports = new DataLogger;