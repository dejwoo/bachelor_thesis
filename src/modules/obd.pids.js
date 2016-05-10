'use strict';
const _ = require("lodash");

function byteToInt(bytes) {
    return parseInt(bytes.join(''),16);
}
// Example for pid support
// B   E   1   F   A   8   1   3
// Binary  1   0   1   1   1   1   1   0   0   0   0   1   1   1   1   1   1   0   1   0   1   0   0   0   0   0   0   1   0   0   1   1
// Supported?  Yes No  Yes Yes Yes Yes Yes No  No  No  No  Yes Yes Yes Yes Yes Yes No  Yes No  Yes No  No  No  No  No  No  Yes No  No  Yes Yes
// PID number  01  02  03  04  05  06  07  08  09  0A  0B  0C  0D  0E  0F  10  11  12  13  14  15  16  17  18  19  1A  1B  1C  1D  1E  1F  20

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
    return _.map(bytes, function(x) { return x.toString(16); });
}
var responsePIDS = {
    "01": {
        "00":{"code":"0100", "description":"PIDs supported 00-20", "convert":parseSupport},
        "01":{"code":"0101", "description":"Monitor status since DTCs cleared", "convert":id},
        "02":{"code":"0102", "description":"DTC that caused required freeze frame data storage", "convert":id},
        "03":{"code":"0103", "description":"Fuel system 1 and 2 status", "convert":id},
        "04":{"code":"0104", "description":"Calculated LOAD Value", "convert":parseEngineLoad},
        "05":{"code":"0105", "description":"Engine Coolant Temperature", "convert":parseCooleantTemperature},
        "06":{"code":"0106", "description":"Short Term Fuel Trim - Bank 1,3", "convert":parseFuelTrim},
        "07":{"code":"0107", "description":"Long Term Fuel Trim - Bank 1,3", "convert":parseFuelTrim},
        "08":{"code":"0108", "description":"Short Term Fuel Trim - Bank 2,4", "convert":parseFuelTrim},
        "09":{"code":"0109", "description":"Long Term Fuel Trim - Bank 2,4", "convert":parseFuelTrim},
        "0A":{"code":"010A", "description":"Fuel Rail Pressure (gauge)", "convert":parseFuelPressure},
        "0B":{"code":"010B", "description":"Intake Manifold Absolute Pressure", "convert":parseIntakeManifold},
        "0C":{"code":"010C", "description":"Engine RPM", "convert":parseRPM},
        "0D":{"code":"010D", "description":"Vehicle Speed Sensor", "convert":parseSpeed},
        "0E":{"code":"010E", "description":"Ignition Timing Advance for #1 Cylinder", "convert":parseIgnitionTiming},
        "0F":{"code":"010F", "description":"Intake Air Temperature", "convert":parseIntakeAirTemp},
        "10":{"code":"0110", "description":"Air Flow Rate from Mass Air Flow Sensor", "convert":parseMassAirflowSensor},
        "11":{"code":"0111", "description":"Absolute Throttle Position", "convert":parseThrottlePos},
        "12":{"code":"0112", "description":"Commanded Secondary Air Status", "convert":id},
        "13":{"code":"0113", "description":"Location of Oxygen Sensors", "convert":id},
        "14":{"code":"0114", "description":"Bank 1 - Sensor 1/Bank 1 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "15":{"code":"0115", "description":"Bank 1 - Sensor 2/Bank 1 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "16":{"code":"0116", "description":"Bank 1 - Sensor 3/Bank 2 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "17":{"code":"0117", "description":"Bank 1 - Sensor 4/Bank 2 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "18":{"code":"0118", "description":"Bank 2 - Sensor 1/Bank 3 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "19":{"code":"0119", "description":"Bank 2 - Sensor 2/Bank 3 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "1A":{"code":"011A", "description":"Bank 2 - Sensor 3/Bank 4 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "1B":{"code":"011B", "description":"Bank 2 - Sensor 4/Bank 4 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "1C":{"code":"011C", "description":"OBD requirements to which vehicle is designed", "convert":id},
        "1D":{"code":"011D", "description":"Location of oxygen sensors", "convert":id},
        "1E":{"code":"011E", "description":"Auxiliary Input Status", "convert":id},
        "1F":{"code":"011F", "description":"Time Since Engine Start", "convert":parseRunTime},
        "20":{"code":"0120", "description":"PIDs supported 21-40", "convert":id},
        "21":{"code":"0121", "description":"Distance Travelled While MIL is Activated", "convert":id},
        "22":{"code":"0122", "description":"Fuel Rail Pressure relative to manifold vacuum", "convert":id},
        "23":{"code":"0123", "description":"Fuel Rail Pressure (diesel)", "convert":id},
        "24":{"code":"0124", "description":"Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "25":{"code":"0125", "description":"Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "26":{"code":"0126", "description":"Bank 1 - Sensor 3 /Bank 2 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "27":{"code":"0127", "description":"Bank 1 - Sensor 4 /Bank 2 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "28":{"code":"0128", "description":"Bank 2 - Sensor 1 /Bank 3 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "29":{"code":"0129", "description":"Bank 2 - Sensor 2 /Bank 3 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "2A":{"code":"012A", "description":"Bank 2 - Sensor 3 /Bank 4 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "2B":{"code":"012B", "description":"Bank 2 - Sensor 4 /Bank 4 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "2C":{"code":"012C", "description":"Commanded EGR", "convert":id},
        "2D":{"code":"012D", "description":"EGR Error", "convert":id},
        "2E":{"code":"012E", "description":"Commanded Evaporative Purge", "convert":id},
        "2F":{"code":"012F", "description":"Fuel Level Input", "convert":id},
        "30":{"code":"0130", "description":"Number of warm-ups since diagnostic trouble codes cleared", "convert":id},
        "31":{"code":"0131", "description":"Distance since diagnostic trouble codes cleared", "convert":id},
        "32":{"code":"0132", "description":"Evap System Vapour Pressure", "convert":id},
        "33":{"code":"0133", "description":"Barometric Pressure", "convert":id},
        "34":{"code":"0134", "description":"Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "35":{"code":"0135", "description":"Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "36":{"code":"0136", "description":"Bank 1 - Sensor 3/Bank 2 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "37":{"code":"0137", "description":"Bank 1 - Sensor 4/Bank 2 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "38":{"code":"0138", "description":"Bank 2 - Sensor 1/Bank 3 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "39":{"code":"0139", "description":"Bank 2 - Sensor 2/Bank 3 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "3A":{"code":"013A", "description":"Bank 2 - Sensor 3/Bank 4 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "3B":{"code":"013B", "description":"Bank 2 - Sensor 4/Bank 4 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "3C":{"code":"013C", "description":"Catalyst Temperature Bank 1 /  Sensor 1", "convert":id},
        "3D":{"code":"013D", "description":"Catalyst Temperature Bank 2 /  Sensor 1", "convert":id},
        "3E":{"code":"013E", "description":"Catalyst Temperature Bank 1 /  Sensor 2", "convert":id},
        "3F":{"code":"013F", "description":"Catalyst Temperature Bank 2 /  Sensor 2", "convert":id},
        "40":{"code":"0140", "description":"PIDs supported 41-60", "convert":id},
        "41":{"code":"0141", "description":"Monitor status this driving cycle", "convert":id},
        "42":{"code":"0142", "description":"Control module voltage", "convert":id},
        "43":{"code":"0143", "description":"Absolute Load Value", "convert":id},
        "44":{"code":"0144", "description":"Fuel/air Commanded Equivalence Ratio", "convert":id},
        "45":{"code":"0145", "description":"Relative Throttle Position", "convert":id},
        "46":{"code":"0146", "description":"Ambient air temperature", "convert":id},
        "47":{"code":"0147", "description":"Absolute Throttle Position B", "convert":id},
        "48":{"code":"0148", "description":"Absolute Throttle Position C", "convert":id},
        "49":{"code":"0149", "description":"Accelerator Pedal Position D", "convert":id},
        "4A":{"code":"014A", "description":"Accelerator Pedal Position E", "convert":id},
        "4B":{"code":"014B", "description":"Accelerator Pedal Position F", "convert":id},
        "4C":{"code":"014C", "description":"Commanded Throttle Actuator Control", "convert":id},
        "4D":{"code":"014D", "description":"Time run by the engine while MIL activated", "convert":id},
        "4E":{"code":"014E", "description":"Time since diagnostic trouble codes cleared", "convert":id},
        "4F":{"code":"014F", "description":"External Test Equipment Configuration #1", "convert":id},
        "50":{"code":"0150", "description":"External Test Equipment Configuration #2", "convert":id},
        "51":{"code":"0151", "description":"Fuel Type", "convert":id},
        "52":{"code":"0152", "description":"Ethanol fuel %", "convert":id},
        "53":{"code":"0153", "description":"Absolute Evap system Vapor Pressure", "convert":id},
        "54":{"code":"0154", "description":"Evap system vapor pressure", "convert":id},
        "55":{"code":"0155", "description":"Short term secondary oxygen sensor trim, A: bank 1, B: bank 3", "convert":id},
        "56":{"code":"0156", "description":"Long term secondary oxygen sensor trim, A: bank 1, B: bank 3", "convert":id},
        "57":{"code":"0157", "description":"Short term secondary oxygen sensor trim, A: bank 2, B: bank 4", "convert":id},
        "58":{"code":"0158", "description":"Long term secondary oxygen sensor trim, A: bank 2, B: bank 4", "convert":id},
        "59":{"code":"0159", "description":"Fuel rail absolute pressure", "convert":id},
        "5A":{"code":"015A", "description":"Relative accelerator pedal position", "convert":id},
        "5B":{"code":"015B", "description":"Hybrid battery pack remaining life", "convert":id},
        "5C":{"code":"015C", "description":"Engine oil temperature", "convert":id},
        "5D":{"code":"015D", "description":"Fuel injection timing", "convert":id},
        "5E":{"code":"015E", "description":"Engine fuel rate", "convert":id},
        "5F":{"code":"015F", "description":"Emission requirements to which vehicle is designed", "convert":id}
    }
};

var exports = module.exports = responsePIDS;