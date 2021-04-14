var express = require('express');
var router = express.Router();

router.get('/ping', function(req, res, next) {
  res.send( { data: 'API says :: Forum for informal catchup and team building activities!' } );
});

module.exports = router;
