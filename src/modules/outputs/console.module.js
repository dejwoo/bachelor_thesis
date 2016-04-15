function consoleOutput () {
	var self = this;
	
}
consoleOutput.prototype.init = function (config,callback) {
	if (typeof config === 'undefined') {
		console.error("console.module.js: Undefined config");
	}

}
consoleOutput.prototype.close = function (callback) {
	return
}
consoleOutput.prototype.send = function (data,callback) {
	return
}
module.exports = new consoleOutput();