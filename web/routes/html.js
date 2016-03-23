var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/about', function(req, res, next) {
  res.render('index', { title: 'dejwoo | About' });
});
router.get('/thesis', function(req, res, next) {
  res.render('index', { title: 'dejwoo | Thesis' });
});
router.get('/timeline', function(req, res, next) {
  res.render('index', { title: 'dejwoo | Timeline' });
});
router.get('/journal', function(req, res, next) {
  res.render('index', { title: 'dejwoo | journal' });
});
router.get('/files', function(req, res, next) {
  res.render('index', { title: 'dejwoo | files' });
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'dejwoo | Home' });
});
router.get('*', function(req, res, next) {
  res.render('index', { title: 'dejwoo | 404' });
});

module.exports = router;
