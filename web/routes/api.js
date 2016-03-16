var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Journal = mongoose.model('Journal');
router.use(function (req, res, next) {
	if (req.method === "GET") {
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
			Journal.find((err, data) => {
				if (err) {
					return res.send(500, err);
				}
				return res.send(data)
			})
		})
		.post(function (req, res) {
			var newJournal = new Journal();
			newJournal.text = req.body.text;
			newJournal.username = req.body.created_by;
			newJournal.save(function (err, journal) {
				if (err){
					return res.send(500,err);
				}
				return res.json(journal);
			});
		});
router.route('/journal/:id')

		.get(function (req,res) {
			Journal.findById(req.params.id, function (err, journal) {
				if (err){
					return res.send(err);
				}
				return res.json(journal);
			});
		})
		.put(function (req,res) {
			Journal.findById(req.params.id, function (err, journal) {
				if (err){
					return res.send(err);
				}
				journal.text = req.body.text;
				journal.username = req.body.created_by;
				journal.save(function (err, journal) {
					if (err){
						return res.send(500,err);
					}
				return res.json(journal);
				});
			});
		})
		.delete(function (req,res) {
			Journal.remove({
				_id:req.params.id
			}, function (err) {
				if (err){
					return res.send(err)
				}
				return res.json("Deleted: " + req.params.id);
			});
		});
module.exports = router;
