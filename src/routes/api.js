var express = require('express');
var router = express.Router();
var fs = require('fs');
var configJSON = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const _ = require('lodash');
const redis = require('redis');

var client =  redis.createClient(6379, "localhost", {no_ready_check: true});
client.auth("%oZtB6G2!AN(S)XiUFhN2kid@CR42J4$AjWYr7SVeSdiCxMR#54*&AhTTY4D2Kd7", function (err) {
	if (err) {
		console.error(err);
	}
});
client.on('connect', function() {
	console.log("Connection to redisDB successfull.");
});

router.route('/config')
	//returns all journal
	.get(function (req,res) {
		// temp
		if (_.isUndefined(configJSON)) {
			return res.send(500, err);
		}
		return res.json(configJSON);

	});
module.exports = router;