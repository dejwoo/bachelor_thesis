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
        "00":{"name":"", "description":"PIDs supported 00-20", "convert":parseSupport},
        "01":{"name":"", "description":"Monitor status since DTCs cleared", "convert":id},
        "02":{"name":"", "description":"DTC that caused required freeze frame data storage", "convert":id},
        "03":{"name":"", "description":"Fuel system 1 and 2 status", "convert":id},
        "04":{"name":"", "description":"Calculated LOAD Value", "convert":parseEngineLoad},
        "05":{"name":"", "description":"Engine Coolant Temperature", "convert":parseCooleantTemperature},
        "06":{"name":"", "description":"Short Term Fuel Trim - Bank 1,3", "convert":parseFuelTrim},
        "07":{"name":"", "description":"Long Term Fuel Trim - Bank 1,3", "convert":parseFuelTrim},
        "08":{"name":"", "description":"Short Term Fuel Trim - Bank 2,4", "convert":parseFuelTrim},
        "09":{"name":"", "description":"Long Term Fuel Trim - Bank 2,4", "convert":parseFuelTrim},
        "0A":{"name":"", "description":"Fuel Rail Pressure (gauge)", "convert":parseFuelPressure},
        "0B":{"name":"", "description":"Intake Manifold Absolute Pressure", "convert":parseIntakeManifold},
        "0C":{"name":"", "description":"Engine RPM", "convert":parseRPM},
        "0D":{"name":"", "description":"Vehicle Speed Sensor", "convert":parseSpeed},
        "0E":{"name":"", "description":"Ignition Timing Advance for #1 Cylinder", "convert":parseIgnitionTiming},
        "0F":{"name":"", "description":"Intake Air Temperature", "convert":parseIntakeAirTemp},
        "10":{"name":"", "description":"Air Flow Rate from Mass Air Flow Sensor", "convert":parseMassAirflowSensor},
        "11":{"name":"", "description":"Absolute Throttle Position", "convert":parseThrottlePos},
        "12":{"name":"", "description":"Commanded Secondary Air Status", "convert":id},
        "13":{"name":"", "description":"Location of Oxygen Sensors", "convert":id},
        "14":{"name":"", "description":"Bank 1 - Sensor 1/Bank 1 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "15":{"name":"", "description":"Bank 1 - Sensor 2/Bank 1 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "16":{"name":"", "description":"Bank 1 - Sensor 3/Bank 2 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "17":{"name":"", "description":"Bank 1 - Sensor 4/Bank 2 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "18":{"name":"", "description":"Bank 2 - Sensor 1/Bank 3 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "19":{"name":"", "description":"Bank 2 - Sensor 2/Bank 3 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "1A":{"name":"", "description":"Bank 2 - Sensor 3/Bank 4 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "1B":{"name":"", "description":"Bank 2 - Sensor 4/Bank 4 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", "convert":parseOxygenOutput},
        "1C":{"name":"", "description":"OBD requirements to which vehicle is designed", "convert":id},
        "1D":{"name":"", "description":"Location of oxygen sensors", "convert":id},
        "1E":{"name":"", "description":"Auxiliary Input Status", "convert":id},
        "1F":{"name":"", "description":"Time Since Engine Start", "convert":parseRunTime},
        "20":{"name":"", "description":"PIDs supported 21-40", "convert":id},
        "21":{"name":"", "description":"Distance Travelled While MIL is Activated", "convert":id},
        "22":{"name":"", "description":"Fuel Rail Pressure relative to manifold vacuum", "convert":id},
        "23":{"name":"", "description":"Fuel Rail Pressure (diesel)", "convert":id},
        "24":{"name":"", "description":"Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "25":{"name":"", "description":"Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "26":{"name":"", "description":"Bank 1 - Sensor 3 /Bank 2 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "27":{"name":"", "description":"Bank 1 - Sensor 4 /Bank 2 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "28":{"name":"", "description":"Bank 2 - Sensor 1 /Bank 3 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "29":{"name":"", "description":"Bank 2 - Sensor 2 /Bank 3 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "2A":{"name":"", "description":"Bank 2 - Sensor 3 /Bank 4 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "2B":{"name":"", "description":"Bank 2 - Sensor 4 /Bank 4 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", "convert":id},
        "2C":{"name":"", "description":"Commanded EGR", "convert":id},
        "2D":{"name":"", "description":"EGR Error", "convert":id},
        "2E":{"name":"", "description":"Commanded Evaporative Purge", "convert":id},
        "2F":{"name":"", "description":"Fuel Level Input", "convert":id},
        "30":{"name":"", "description":"Number of warm-ups since diagnostic trouble codes cleared", "convert":id},
        "31":{"name":"", "description":"Distance since diagnostic trouble codes cleared", "convert":id},
        "32":{"name":"", "description":"Evap System Vapour Pressure", "convert":id},
        "33":{"name":"", "description":"Barometric Pressure", "convert":id},
        "34":{"name":"", "description":"Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "35":{"name":"", "description":"Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "36":{"name":"", "description":"Bank 1 - Sensor 3/Bank 2 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "37":{"name":"", "description":"Bank 1 - Sensor 4/Bank 2 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "38":{"name":"", "description":"Bank 2 - Sensor 1/Bank 3 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "39":{"name":"", "description":"Bank 2 - Sensor 2/Bank 3 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "3A":{"name":"", "description":"Bank 2 - Sensor 3/Bank 4 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "3B":{"name":"", "description":"Bank 2 - Sensor 4/Bank 4 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", "convert":id},
        "3C":{"name":"", "description":"Catalyst Temperature Bank 1 /  Sensor 1", "convert":id},
        "3D":{"name":"", "description":"Catalyst Temperature Bank 2 /  Sensor 1", "convert":id},
        "3E":{"name":"", "description":"Catalyst Temperature Bank 1 /  Sensor 2", "convert":id},
        "3F":{"name":"", "description":"Catalyst Temperature Bank 2 /  Sensor 2", "convert":id},
        "40":{"name":"", "description":"PIDs supported 41-60", "convert":id},
        "41":{"name":"", "description":"Monitor status this driving cycle", "convert":id},
        "42":{"name":"", "description":"Control module voltage", "convert":id},
        "43":{"name":"", "description":"Absolute Load Value", "convert":id},
        "44":{"name":"", "description":"Fuel/air Commanded Equivalence Ratio", "convert":id},
        "45":{"name":"", "description":"Relative Throttle Position", "convert":id},
        "46":{"name":"", "description":"Ambient air temperature", "convert":id},
        "47":{"name":"", "description":"Absolute Throttle Position B", "convert":id},
        "48":{"name":"", "description":"Absolute Throttle Position C", "convert":id},
        "49":{"name":"", "description":"Accelerator Pedal Position D", "convert":id},
        "4A":{"name":"", "description":"Accelerator Pedal Position E", "convert":id},
        "4B":{"name":"", "description":"Accelerator Pedal Position F", "convert":id},
        "4C":{"name":"", "description":"Commanded Throttle Actuator Control", "convert":id},
        "4D":{"name":"", "description":"Time run by the engine while MIL activated", "convert":id},
        "4E":{"name":"", "description":"Time since diagnostic trouble codes cleared", "convert":id},
        "4F":{"name":"", "description":"External Test Equipment Configuration #1", "convert":id},
        "50":{"name":"", "description":"External Test Equipment Configuration #2", "convert":id},
        "51":{"name":"", "description":"Fuel Type", "convert":id},
        "52":{"name":"", "description":"Ethanol fuel %", "convert":id},
        "53":{"name":"", "description":"Absolute Evap system Vapor Pressure", "convert":id},
        "54":{"name":"", "description":"Evap system vapor pressure", "convert":id},
        "55":{"name":"", "description":"Short term secondary oxygen sensor trim, A: bank 1, B: bank 3", "convert":id},
        "56":{"name":"", "description":"Long term secondary oxygen sensor trim, A: bank 1, B: bank 3", "convert":id},
        "57":{"name":"", "description":"Short term secondary oxygen sensor trim, A: bank 2, B: bank 4", "convert":id},
        "58":{"name":"", "description":"Long term secondary oxygen sensor trim, A: bank 2, B: bank 4", "convert":id},
        "59":{"name":"", "description":"Fuel rail absolute pressure", "convert":id},
        "5A":{"name":"", "description":"Relative accelerator pedal position", "convert":id},
        "5B":{"name":"", "description":"Hybrid battery pack remaining life", "convert":id},
        "5C":{"name":"", "description":"Engine oil temperature", "convert":id},
        "5D":{"name":"", "description":"Fuel injection timing", "convert":id},
        "5E":{"name":"", "description":"Engine fuel rate", "convert":id},
        "5F":{"name":"", "description":"Emission requirements to which vehicle is designed", "convert":id}
    }
};

var exports = module.exports = responsePIDS;