'use strict'
// LSM303_ADDRESS_ACCEL = (0x32 >> 1)  # 0011001x

// LSM303_ADDRESS_MAG   = (0x3C >> 1)  # 0011110x
//                                          # Default    Type
// LSM303_REGISTER_ACCEL_CTRL_REG1_A = 0x20 # 00000111   rw
// LSM303_REGISTER_ACCEL_CTRL_REG4_A = 0x23 # 00000000   rw
// LSM303_REGISTER_ACCEL_OUT_X_L_A   = 0x28

// LSM303_REGISTER_MAG_CRB_REG_M     = 0x01
// LSM303_REGISTER_MAG_MR_REG_M      = 0x02
// LSM303_REGISTER_MAG_OUT_X_H_M     = 0x03

// # Gain settings for setMagGain()
// LSM303_MAGGAIN_1_3 = 0x20 # +/- 1.3
// LSM303_MAGGAIN_1_9 = 0x40 # +/- 1.9
// LSM303_MAGGAIN_2_5 = 0x60 # +/- 2.5
// LSM303_MAGGAIN_4_0 = 0x80 # +/- 4.0
// LSM303_MAGGAIN_4_7 = 0xA0 # +/- 4.7
// LSM303_MAGGAIN_5_6 = 0xC0 # +/- 5.6
// LSM303_MAGGAIN_8_1 = 0xE0 # +/- 8.1


//  	DS1621_ADDR = 0x48;
//   		DS1621_CMD_ACCESS_TH = 0xa1;

//  	TSL2561_ADDR = 0x39;
//   		TSL2561_CMD = 0x80;
//   		TSL2561_REG_ID = 0x0a;
	const LSM303_ACCEL = {};
 	LSM303_ACCEL.ADDRESS_DEFAULT = 0x19;
		LSM303_ACCEL.CTRL_REG1_A = 0x20;
		LSM303_ACCEL.CTRL_REG1_POWER_DOWN = 0x00;
// 	CTRL_REG1_A register
// ODR3 | ODR2 | ODR1 | ODR0 | LPen | Zen | Yen | Xen
// ODR3-0 Data rate selection. Default value: 0 (0000: power-down; others: refer below)
// LPen Low-power mode enable. Default value: 0 (0: normal mode; 1: low-power mode)
// Zen Z axis enable. Default value: 1  (0: Z axis disabled; 1: Z axis enabled)
// Yen Y axis enable. Default value: 1 (0: Y axis disabled; 1: Y axis enabled)
// Xen X axis enable. Default value: 1 (0: X axis disabled; 1: X axis enabled)
// ODR3 ODR2 ODR1 ODR0 Power mode selection
//  0    0    0    0      Power-down mode
//  0    0    0    1      Normal / low-power mode (1 Hz)
//  0    0    1    0      Normal / low-power mode (10 Hz)
//  0    0    1    1      Normal / low-power mode (25 Hz)
//  0    1    0    0      Normal / low-power mode (50 Hz)
//  0    1    0    1      Normal / low-power mode (100 Hz)
//  0    1    1    0      Normal / low-power mode (200 Hz)
//  0    1    1    1      Normal / low-power mode (400 Hz)
		LSM303_ACCEL.CTRL_REG1_RATE_1HZ = 0x10;
		LSM303_ACCEL.CTRL_REG1_RATE_10HZ = 0x20;
		LSM303_ACCEL.CTRL_REG1_RATE_25HZ = 0x30;
		LSM303_ACCEL.CTRL_REG1_RATE_50HZ = 0x40;
		LSM303_ACCEL.CTRL_REG1_RATE_100HZ = 0x50;
		LSM303_ACCEL.CTRL_REG1_RATE_200HZ = 0x60;
		LSM303_ACCEL.CTRL_REG1_RATE_400HZ = 0x70;
		LSM303_ACCEL.CTRL_REG1_RATE_LO_MO_1620KHZ = 0x80;
		LSM303_ACCEL.CTRL_REG1_RATE_1344kHZ = 0x90;
		LSM303_ACCEL.CTRL_REG1_LOW_POWER_MODE = 0x8;
		LSM303_ACCEL.CTRL_REG1_AXIS_Z_Y_X = 0x7;
		LSM303_ACCEL.CTRL_REG1_AXIS_Z_Y = 0x6;
		LSM303_ACCEL.CTRL_REG1_AXIS_Z_X = 0x5;
		LSM303_ACCEL.CTRL_REG1_AXIS_Z = 0x4;
		LSM303_ACCEL.CTRL_REG1_AXIS_Y_X = 0x3;
		LSM303_ACCEL.CTRL_REG1_AXIS_Y = 0x2;
		LSM303_ACCEL.CTRL_REG1_AXIS_X = 0x1;

	LSM303_ACCEL.CTRL_REG2_A = 0x21;
// CTRL_REG2_A register
// HPM1 | HPM0 | HPCF2 | HPCF1 | FDS | HPCLICK | HPIS2 | HPIS1
// HPM1 -HPM0 High pass filter mode selection. Default value: 00 (refer to below)
// HPCF2 - HPCF1 High pass filter cut-off frequency selection
// FDS - Filtered data selection. Default value: 0
// (0: internal filter bypassed; 1: data from internal filter sent to output register and FIFO)
// HPCLICK High pass filter enabled for CLICK function. (0: filter bypassed; 1: filter enabled)
// HPIS2 High pass filter enabled for AOI function on Interrupt 2; (0: filter bypassed, 1: filter enabled)
// HPIS1 High pass filter enabled for AOI function on Interrupt 1 (0: filter bypassed; 1: filter enabled)
// HPM1 HPM0 High pass filter mode
//  0     0       Normal mode (reset reading HP_RESET_FILTER)
//  0     1       Reference signal for filtering
//  1     0       Normal mode
//  1     1       Autoreset on interrupt event
		LSM303_ACCEL.CTRL_REG2_HPM_NORMAL = 0x80;
		LSM303_ACCEL.CTRL_REG2_HPM_AUTORESET = 0xC0;
		LSM303_ACCEL.CTRL_REG2_HPM_NORMAL_HP_RESET_FILTER = 0x00;
		LSM303_ACCEL.CTRL_REG2_HPM_REFERENCE_FILTER = 0x40;
		// TODO: NOT IMPLEMENTED; could not proper documentation
		LSM303_ACCEL.CTRL_REG2_HPCF = 0x00;
		LSM303_ACCEL.CTRL_REG2_FDS = 0x00;
		LSM303_ACCEL.CTRL_REG2_HPCLICK = 0x00;
		LSM303_ACCEL.CTRL_REG2_HPIS2 = 0x00;
		LSM303_ACCEL.CTRL_REG2_HPIS1 = 0x00;
 LSM303_ACCEL.CTRL_REG3_A = 0x22;
// FIFO_EN |  STOP_FTH | INT_XL_INACT | INT_XL_IG2 | INT_XL_IG1 | INT_XL_OVR | INT_XL_FTH | INT_XL_DRDY
// FIFO_EN FIFO enable. Default value 0. (0: disable; 1: enable)
// STOP_FTH Enable FIFO threshold level use. Default value 0. (0: disable; 1: enable)
// INT_XL_INACT Inactivity interrupt on INT_XL. Default value 0. (0: disable; 1: enable)
// INT_XL_IG2 Interrupt generator 2 on INT_XL. Default value 0. (0: disable; 1: enable)
// INT_XL_IG1 Interrupt generator 1 on INT_XL. Default value 0. (0: disable; 1: enable)
// INT_XL_OVR FIFO overrun signal on INT_XL
// INT_XL_FTH FIFO threshold signal on INT_XL
// INT_XL_DRDY Data ready signal on INT_XL
	  LSM303_ACCEL.CTRL_REG3_FIFO_E = 0x80;
	  LSM303_ACCEL.CTRL_REG3_STOP_FTH = 0x40;
	  LSM303_ACCEL.CTRL_REG3_INT_XL_INACT = 0x20;
	  LSM303_ACCEL.CTRL_REG3_INT_XL_IG2 = 0x10;
	  LSM303_ACCEL.CTRL_REG3_INT_XL_IG1 = 0x8;
	  LSM303_ACCEL.CTRL_REG3_INT_XL_OVR  = 0x4;
	  LSM303_ACCEL.CTRL_REG3_INT_XL_FTH = 0x2;
	  LSM303_ACCEL.CTRL_REG3_INT_XL_DRDY = 0x1;

	  LSM303_ACCEL.CTRL_REG4_A = 0x23;
// BDU | BLE | FS1 | FS0 | HR | 0(*) | 0(*) | SIM
// *This bit must be set to ‘0’ for correct operation of the device.
// BDU Block data update. Default value: 0
// (0: continuous update; 1: output registers not updated until MSB and LSB have been read
// BLE Big/little endian data selection. Default value 0.
// (0: data LSB @ lower address; 1: data MSB @ lower address)
// FS[1:0] Full-scale selection. Default value: 00
// (00: ±2 g; 01: ±4 g, 10: ±8 g, 11: ±16 g)
// HR High-resolution output mode: Default value: 0
// (0: high-resolution disable; 1: high-resolution enable)
// SIM SPI serial interface mode selection. Default value: 0
// (0: 4-wire interface; 1: 3-wire interface).
	  LSM303_ACCEL.CTRL_REG4_BDU = 0x80;
	  LSM303_ACCEL.CTRL_REG4_BLE = 0x40;
	  LSM303_ACCEL.CTRL_REG4_FS_4G = 0x10;
	  LSM303_ACCEL.CTRL_REG4_FS_8G = 0x20;
	  LSM303_ACCEL.CTRL_REG4_FS_16G = 0x30;
	  LSM303_ACCEL.CTRL_REG4_FS = 0x20;
	  LSM303_ACCEL.CTRL_REG4_HR = 0x8;
	  LSM303_ACCEL.CTRL_REG4_SIM_3WIRES = 0x1;
module.exports = LSM303_ACCEL;
