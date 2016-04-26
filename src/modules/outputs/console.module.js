function consoleOutput () {
	var self = this;

}
consoleOutput.prototype.init = function (config,callback) {
	if (typeof config === 'undefined') {
		console.error("console.module.js: Undefined config");
	}
	this.config = config;
	if (typeof this.config.messageHeader !== 'undefined') {
		this.messageHeader = config.messageHeader
	}
}
consoleOutput.prototype.close = function (callback) {
    if (typeof callback !== 'undefined') {
        callback();
    }
	return;
}
consoleOutput.prototype.send = function (data,callback) {
	console.log(this.messageHeader + " | " + data.header.name);
	console.log(data.body);
}
module.exports = new consoleOutput();
