function consoleOutput () {
	var self = this;

}
consoleOutput.prototype.init = function (config,callback) {
	if (typeof config === 'undefined') {
		console.error("console.module.js: Undefined config");
	}
	if (typeof config.messageHeader !== 'undefined') {
		this.messageHeader = config.messageHeader
	}
}
consoleOutput.prototype.close = function (callback) {
    if (typeof callback !== 'undefined') {
        callback();
    }
	return;
}
consoleOutput.prototype.send = function (data,inputModule,callback) {
	console.log(this.messageHeader + " | " + inputModule.name);
	console.log(data);
}
module.exports = new consoleOutput();
