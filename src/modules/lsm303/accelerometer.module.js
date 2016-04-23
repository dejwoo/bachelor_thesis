var i2c = require('i2c-bus'),
  i2c1;
const LSM303_ACCEL = require('./accelerometer_const.js');


function Accelerometer(options) {
	if (typeof options !== 'undefined') {
		this.i2c_num= options.num ? options.num : 1;
		this.address= options.address ? options.address : LSM303_ACCEL.ADDRESS_DEFAULT;
		this.reg1_a_cmd = options.reg1_a_cmd ? options.reg1_a_cmd : LSM303_ACCEL.CTRL_REG1_AXIS_Z_Y_X | LSM303_ACCEL.CTRL_REG1_RATE_100HZ
		this.reg4_a_cmd = options.reg4_a_cmd ? options.reg4_a_cmd : LSM303_ACCEL.CTRL_REG4_FS_16G | LSM303_ACCEL.CTRL_REG4_HR
	} else {
		this.i2c_num = 1;
		this.address = LSM303_ACCEL.ADDRESS_DEFAULT;
		this.reg1_a_cmd = LSM303_ACCEL.CTRL_REG1_AXIS_Z_Y_X | LSM303_ACCEL.CTRL_REG1_RATE_100HZ
		this.reg4_a_cmd = LSM303_ACCEL.CTRL_REG4_FS_16G | LSM303_ACCEL.CTRL_REG4_HR
	}
}
Accelerometer.prototype.init = function() {
	this.i2c1 = i2c.open(this.i2c_num, function (err) {
  		if (err) {
  			throw err;
  		}
  		console.log("I2C inicialized.")
  	});
  	this.i2c1.writeByte(this.address, LSM303_ACCEL.CTRL_REG1_A, this.reg1_a_cmd, function (err) {
  		if (err) {
  			throw err;
  		}
  		console.log("LSM303 Accelerometer inicialized.")
  	});
  	this.i2c1.writeByte(this.address, LSM303_ACCEL.CTRL_REG4_A, this.reg4_a_cmd, function (err) {
  		if (err) {
  			throw err;
  		}
  		console.log("LSM303 Accelerometer resolution and scale successfuly set.")
  	});
}
Accelerometer.prototype.read = function() {
	//asuming XYZ axes for now
	var buf = new Buffer(6);
	//puzzled by 0x80 shift, dont know why its there, read it from official adafruit library
	var output = {};
	var axes = ["x","y","z"];
	this.i2c1.readI2cBlock(this.address, 0x28 | 0x80, 6, buf, function (err, bytesRead, buffer) {
		if (err) {
			throw err;
		}
		if (bytesRead != 6) {
			console.log("Did not read intended length of bytes!");
		}
	});
	//space for buffer operation's
	for (var i = 0; i <= 4; i+=2) {
		var n = buf[i] | (buf[i+1] << 8);
		output[axes[i/2]] = n;
	}
	return output;
}
module.exports = Accelerometer
