var express = require('express');
var router = express.Router();

const ping = require('./ping');

router.get('/ping', ping);

module.exports = router;
