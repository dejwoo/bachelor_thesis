var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
	if (req.methor === "GET") {
		//continue to the next m,iddleware or request handler
		return next();
	}
	if (!req.isAuthenticated()) {
		//user not authenticated, redirect to login page.
		return res.redirect('/#login');
	};
	//user authenticated, continue to next middleware handler
	return next();
})

router.route('/journal')
		//returns all journal
		.get(function (req,res) {
			// temp
			res.send({message:'TODO: return all journal notes'});
		})
		.post(function (req, res) {
			res.send({message:'TODO: Create a new journal entry'});
		});
router.route('/journal/:id')

		.get(function (req,res) {
			res.send({message: 'TODO return post with ID: ' + req.params.id});
		})
		.put(function (req,res) {
			res.send({message: 'TODO modify post with ID: ' + req.params.id});
		})
		.delete(function (req,res) {
			res.send({message: 'TODO delete post with ID: ' + req.params.id});
		})
module.exports = router;
