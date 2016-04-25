'use strict';
function byteToInt(bytes) {
    return parseInt(bytes.join(''),16);
}
function strToHex(strBytes) {
    console.log("strToHex B:", strBytes)
    var output = [];
    for (var index = 0; index < strBytes.length; index++) {
        output.push(parseInt(strBytes[index],16));
    }
    console.log("strToHex E:", output)
    return output;
}
// Example for pid support
// B   E   1   F   A   8   1   3
// Binary  1   0   1   1   1   1   1   0   0   0   0   1   1   1   1   1   1   0   1   0   1   0   0   0   0   0   0   1   0   0   1   1
// Supported?  Yes No  Yes Yes Yes Yes Yes No  No  No  No  Yes Yes Yes Yes Yes Yes No  Yes No  Yes No  No  No  No  No  No  Yes No  No  Yes Yes
// PID number  01  02  03  04  05  06  07  08  09  0A  0B  0C  0D  0E  0F  10  11  12  13  14  15  16  17  18  19  1A  1B  1C  1D  1E  1F  20
function binToStr(intBytes) {
    var output = "";
    for (var index = 0; index < intBytes.length; index++) {
        output += intBytes[index].toString(2);
    }
    return output;
}
function dropHeader(strBytes) {
    return strBytes.slice(2); //first 2 bytes are mode + 40 and PID number
}
function parseSupport(bytes) {
    var output = strToHex(dropHeader(bytes));
    return binToStr(output);
}
function parseSpeed(bytes) {
    return parseInt(bytes[0], 16);
}
function parseCooleantTemperature(bytes) {
    return parseInt(bytes[0],16)-40;
}
function parseRPM(bytes) {
    return ( parseInt(bytes[0], 16)*256 + parseInt(bytes[1],16) )/4;
}
function parseFuelTrim(bytes) {
    return (parseInt(bytes[0],16)/1.28)-100;
}
function parseEngineLoad(bytes) {
    return parseInt(bytes[0],16)/2.55;
}
function parseFuelPressure(bytes) {
    return parseInt(bytes[0],16)*3;
}
function parseIntakeManifold(bytes) {
    return parseInt(bytes[0],16);
}
function parseIgnitionTiming(bytes) {
    return (parseInt(bytes[0],16)/2) - 64;
}
function parseIntakeAirTemp(bytes) {
    return (parseInt(bytes[0],16) - 40);
}
function parseMassAirflowSensor(bytes) {
    return (parseInt(bytes[0],16)*256+parseInt(bytes[1],16))/100;
}
function parseThrottlePos(bytes) {
    return parseInt(bytes[0], 16) * (100 / 255);
}
function parseAirFlowRate(bytes) {
    return (parseInt(bytes[0], 16) * 256.0) + (parseInt(bytes[1], 16) / 100);
}
function parseOxygenOutput(bytes) {
    return parseInt(bytes[0], 16) / 200;
}
function parseRunTime(bytes) {
    return parseInt(bytes[0],16)*256 + parseInt(bytes[1],16)
}
function id(bytes) {
    return bytes;
}
var responsePIDS = {
    //Realtime data
    "01_pid_support" : {name: "01_pid_support", mode: "01", pid: "00", bytes: 4,description: "PIDs supported 00-20", min: 0, max: 0, unit: "Bit Encoded", convert: parseSupport},
    "dtc_cnt" : {name: "dtc_cnt", mode: "01", pid: "01", bytes: 4,       description: "Monitor status since DTCs cleared", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "dtcfrzf" : {name: "dtcfrzf", mode: "01", pid: "02", bytes: 4,       description: "DTC that caused required freeze frame data storage", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "fuelsys" : {name: "pa", mode: "01", pid: "03", bytes: 8,       description: "Fuel system 1 and 2 status", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "load_pct" : {name: "load_pct", mode: "01", pid: "04", bytes: 2,      description: "Calculated LOAD Value", min: 0, max: 100, unit: "%", convert: parseEngineLoad},
    "temp" : {name: "temp", mode: "01", pid: "05", bytes: 1,          description: "Engine Coolant Temperature", min: -40, max: 215, unit: "Celsius", convert: parseCooleantTemperature},
    "shrtft13" : {name: "shrtft13", mode: "01", pid: "06", bytes: 1,      description: "Short Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convert: parseFuelTrim},
    "longft13" : {name: "longft13", mode: "01", pid: "07", bytes: 1,      description: "Long Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convert: parseFuelTrim},
    "shrtft24" : {name: "shrtft24", mode: "01", pid: "08", bytes: 1,      description: "Short Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convert: parseFuelTrim},
    "longft24" : {name: "longft24", mode: "01", pid: "09", bytes: 1,      description: "Long Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convert: parseFuelTrim},
    "frp" : {name: "frp", mode: "01", pid: "0A", bytes: 1,           description: "Fuel Rail Pressure (gauge)", min: -100, max: 99.22, unit: "kPa", convert: parseFuelPressure},
    "map" : {name: "map", mode: "01", pid: "0B", bytes: 1,           description: "Intake Manifold Absolute Pressure", min: 0, max: 765, unit: "kPa", convert: parseIntakeManifold},
    "rpm" : {name: "rpm", mode: "01", pid: "0C", bytes: 2,           description: "Engine RPM", min: 0, max: 16383.75, unit: "rev/min", convert: parseRPM},
    "vss" : {name: "vss", mode: "01", pid: "0D", bytes: 1,           description: "Vehicle Speed Sensor", min: 0, max: 255, unit: "km/h", convert: parseSpeed},
    "sparkadv" : {name: "sparkadv", mode: "01", pid: "0E", bytes: 1,      description: "Ignition Timing Advance for #1 Cylinder", min: -64, max: 63.5, unit: "degrees relative to #1 cylinder",  convert: parseIgnitionTiming},
    "iat" : {name: "iat", mode: "01", pid: "0F", bytes: 1,           description: "Intake Air Temperature", min: -40, max: 215, unit: "Celsius", convert: parseIntakeAirTemp},
    "maf" : {name: "maf", mode: "01", pid: "10", bytes: 2,           description: "Air Flow Rate from Mass Air Flow Sensor", min: 0, max: 655.35, unit: "g/s", convert: parseMassAirflowSensor},
    "throttlepos" : {name: "throttlepos", mode: "01", pid: "11", bytes: 1,   description: "Absolute Throttle Position", min: 1, max: 100, unit: "%", convert: parseThrottlePos},
    "air_stat" : {name: "air_stat", mode: "01", pid: "12", bytes: 1,      description: "Commanded Secondary Air Status", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "o2sloc" : {name: "o2sloc", mode: "01", pid: "13", bytes: 1,        description: "Location of Oxygen Sensors", min: 0, max: 0, unit: "Bit Encoded", convert: id},
    "o2s11" : {name: "o2s11", mode: "01", pid: "14", bytes: 2,         description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "o2s12" : {name: "o2s12", mode: "01", pid: "15", bytes: 2,         description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "o2s13" : {name: "o2s13", mode: "01", pid: "16", bytes: 2,         description: "Bank 1 - Sensor 3/Bank 2 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "o2s14" : {name: "o2s14", mode: "01", pid: "17", bytes: 2,         description: "Bank 1 - Sensor 4/Bank 2 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "o2s21" : {name: "o2s21", mode: "01", pid: "18", bytes: 2,         description: "Bank 2 - Sensor 1/Bank 3 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "o2s22" : {name: "o2s22", mode: "01", pid: "19", bytes: 2,         description: "Bank 2 - Sensor 2/Bank 3 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "o2s23" : {name: "o2s23", mode: "01", pid: "1A", bytes: 2,         description: "Bank 2 - Sensor 3/Bank 4 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "o2s24" : {name: "o2s24", mode: "01", pid: "1B", bytes: 2,         description: "Bank 2 - Sensor 4/Bank 4 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convert: parseOxygenOutput},
    "obdsup" : {name: "obdsup", mode: "01", pid: "1C", bytes: 1,        description: "OBD requirements to which vehicle is designed", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "o2sloc2" : {name: "o2sloc2", mode: "01", pid: "1D", bytes: 1,       description: "Location of oxygen sensors", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "pto_stat" : {name: "pto_stat", mode: "01", pid: "1E", bytes: 1,      description: "Auxiliary Input Status", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "runtm" : {name: "runtm", mode: "01", pid: "1F", bytes: 2,         description: "Time Since Engine Start", min: 0, max: 65535, unit: "seconds", convert: parseRunTime},
    //not implemented parse function after
    "piddsupp2" : {name: "piddsupp2", mode: "01", pid: "20", bytes: 4,     description: "PIDs supported 21-40", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "mil_dist" : {mode: "01", pid: "21", bytes: 4,      description: "Distance Travelled While MIL is Activated", min: 0, max: 65535, unit: "km", convert: byteToInt},
    "frpm" : {mode: "01", pid: "22", bytes: 2,          description: "Fuel Rail Pressure relative to manifold vacuum", min: 0, max: 5177.265, unit: "kPa", convert: byteToInt},
    "frpd" : {mode: "01", pid: "23", bytes: 2,          description: "Fuel Rail Pressure (diesel)", min: 0, max: 655350, unit: "kPa", convert: byteToInt},
    "lambda11" : {mode: "01", pid: "24", bytes: 4,      description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambda12" : {mode: "01", pid: "25", bytes: 4,      description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambda13" : {mode: "01", pid: "26", bytes: 4,      description: "Bank 1 - Sensor 3 /Bank 2 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambda14" : {mode: "01", pid: "27", bytes: 4,      description: "Bank 1 - Sensor 4 /Bank 2 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambda21" : {mode: "01", pid: "28", bytes: 4,      description: "Bank 2 - Sensor 1 /Bank 3 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambda22" : {mode: "01", pid: "29", bytes: 4,      description: "Bank 2 - Sensor 2 /Bank 3 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambda23" : {mode: "01", pid: "2A", bytes: 4,      description: "Bank 2 - Sensor 3 /Bank 4 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambda24" : {mode: "01", pid: "2B", bytes: 4,      description: "Bank 2 - Sensor 4 /Bank 4 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "egr_pct" : {mode: "01", pid: "2C", bytes: 1,       description: "Commanded EGR", min: 0, max: 100, unit: "%", convert: byteToInt},
    "egr_err" : {mode: "01", pid: "2D", bytes: 1,       description: "EGR Error", min: -100, max: 99.22, unit: "%", convert: byteToInt},
    "evap_pct" : {mode: "01", pid: "2E", bytes: 1,      description: "Commanded Evaporative Purge", min: 0, max: 100, unit: "%", convert: byteToInt},
    "fli" : {mode: "01", pid: "2F", bytes: 1,           description: "Fuel Level Input", min: 0, max: 100, unit: "%", convert: byteToInt},
    "warm_ups" : {mode: "01", pid: "30", bytes: 1,      description: "Number of warm-ups since diagnostic trouble codes cleared", min: 0, max: 255, unit: "", convert: byteToInt},
    "clr_dist" : {mode: "01", pid: "31", bytes: 2,      description: "Distance since diagnostic trouble codes cleared", min: 0, max: 65535, unit: "km", convert: byteToInt},
    "evap_vp" : {mode: "01", pid: "32", bytes: 2,       description: "Evap System Vapour Pressure", min: -8192, max: 8192, unit: "Pa", convert: byteToInt},
    "baro" : {mode: "01", pid: "33", bytes: 1,          description: "Barometric Pressure", min: 0, max: 255, unit: "kPa", convert: byteToInt},
    "lambdac11" : {mode: "01", pid: "34", bytes: 4,     description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambdac12" : {mode: "01", pid: "35", bytes: 4,     description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambdac13" : {mode: "01", pid: "36", bytes: 4,     description: "Bank 1 - Sensor 3/Bank 2 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambdac14" : {mode: "01", pid: "37", bytes: 4,     description: "Bank 1 - Sensor 4/Bank 2 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambdac21" : {mode: "01", pid: "38", bytes: 4,     description: "Bank 2 - Sensor 1/Bank 3 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambdac22" : {mode: "01", pid: "39", bytes: 4,     description: "Bank 2 - Sensor 2/Bank 3 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambdac23" : {mode: "01", pid: "3A", bytes: 4,     description: "Bank 2 - Sensor 3/Bank 4 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "lambdac24" : {mode: "01", pid: "3B", bytes: 4,     description: "Bank 2 - Sensor 4/Bank 4 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "catemp11" : {mode: "01", pid: "3C", bytes: 2,      description: "Catalyst Temperature Bank 1 /  Sensor 1", min: -40, max: 6513.5, unit: "Celsius", convert: byteToInt},
    "catemp21" : {mode: "01", pid: "3D", bytes: 2,      description: "Catalyst Temperature Bank 2 /  Sensor 1", min: -40, max: 6513.5, unit: "Celsius", convert: byteToInt},
    "catemp12" : {mode: "01", pid: "3E", bytes: 2,      description: "Catalyst Temperature Bank 1 /  Sensor 2", min: -40, max: 6513.5, unit: "Celsius", convert: byteToInt},
    "catemp22" : {mode: "01", pid: "3F", bytes: 2,      description: "Catalyst Temperature Bank 2 /  Sensor 2", min: -40, max: 6513.5, unit: "Celsius", convert: byteToInt},
    "piddsupp4" : {mode: "01", pid: "40", bytes: 4,     description: "PIDs supported 41-60", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "monitorstat" : {mode: "01", pid: "41", bytes: 4,   description: "Monitor status this driving cycle", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "vpwr" : {mode: "01", pid: "42", bytes: 2,          description: "Control module voltage", min: 0, max: 65535, unit: "V", convert: byteToInt},
    "load_abs" : {mode: "01", pid: "43", bytes: 2,      description: "Absolute Load Value", min: 0, max: 25700, unit: "%", convert: byteToInt},
    "lambda" : {mode: "01", pid: "44", bytes: 2,        description: "Fuel/air Commanded Equivalence Ratio", min: 0, max: 2, unit: "(ratio)", convert: byteToInt},
    "tp_r" : {mode: "01", pid: "45", bytes: 1,          description: "Relative Throttle Position", min: 0, max: 100, unit: "%", convert: byteToInt},
    "aat" : {mode: "01", pid: "46", bytes: 1,           description: "Ambient air temperature", min: -40, max: 215, unit: "Celsius", convert: byteToInt},
    "tp_b" : {mode: "01", pid: "47", bytes: 1,          description: "Absolute Throttle Position B", min: 0, max: 100, unit: "%", convert: byteToInt},
    "tp_c" : {mode: "01", pid: "48", bytes: 1,          description: "Absolute Throttle Position C", min: 0, max: 100, unit: "%", convert: byteToInt},
    "app_d" : {mode: "01", pid: "49", bytes: 1,         description: "Accelerator Pedal Position D", min: 0, max: 100, unit: "%", convert: byteToInt},
    "app_e" : {mode: "01", pid: "4A", bytes: 1,         description: "Accelerator Pedal Position E", min: 0, max: 100, unit: "%", convert: byteToInt},
    "app_f" : {mode: "01", pid: "4B", bytes: 1,         description: "Accelerator Pedal Position F", min: 0, max: 100, unit: "%", convert: byteToInt},
    "tac_pct" : {mode: "01", pid: "4C", bytes: 1,       description: "Commanded Throttle Actuator Control", min: 0, max: 100, unit: "%", convert: byteToInt},
    "mil_time" : {mode: "01", pid: "4D", bytes: 2,      description: "Time run by the engine while MIL activated", min: 0, max: 65525, unit: "minutes", convert: byteToInt},
    "clr_time" : {mode: "01", pid: "4E", bytes: 2,      description: "Time since diagnostic trouble codes cleared", min: 0, max: 65535, unit: "minutes", convert: byteToInt},
    "exttest1" : {mode: "01", pid: "4F", bytes: 4,      description: "External Test Equipment Configuration #1", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "exttest2" : {mode: "01", pid: "50", bytes: 4,      description: "External Test Equipment Configuration #2", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "fuel_type" : {mode: "01", pid: "51", bytes: 2,     description: "Fuel Type", min: 0, max: 0, unit: "Bit Encoded", convert: byteToInt},
    "alch_pct" : {mode: "01", pid: "52", bytes: 2,      description: "Ethanol fuel %", min: 0, max: 100, unit: "%", convert: byteToInt},

    //DTC's
    "requestdtc" : {mode: "03", pid: undefined, bytes: 6,  description: "Requested DTC", convert: byteToInt}, //n*6 --> For each code, 6 bytes.
    "cleardtc" : {mode: "04", pid: undefined, bytes: 0,  description: "Clear Trouble Codes (Clear engine light)", convert: byteToInt},

    //VIN
    "vinsupp0" : {mode: "09", pid: "00", bytes: 4,  description: "Vehicle Identification Number", convert: byteToInt},
    "vin_mscout" : {mode: "09", pid: "01", bytes: 1,  description: "VIN message count", convert: byteToInt},
    "vin" : {mode: "09", pid: "02", bytes: 20,  description: "Vehicle Identification Number", convert: byteToInt}
};

var exports = module.exports = responsePIDS;