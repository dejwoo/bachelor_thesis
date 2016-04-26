var express = require('express');
var router = express.Router();
var fs = require('fs');
var configJSON = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const _ = require('lodash');


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