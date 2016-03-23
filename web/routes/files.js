var express = require('express');
var router = express.Router();


router.get('/:name', function(req, res, next) {
  var options = {
    root: __dirname + '/../public/files/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  // console.log(options);
  // console.log(req.params.name);
  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
});
module.exports = router;
