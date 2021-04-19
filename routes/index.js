var express = require('express');
var router = express.Router();

router.get('/ping', function(req, res, next) {
  res.send( { data: 'API says :: web-storm!' } );
});

router.get('') 

// Set up signalling server using socket.io
// Session control messages to open/close communication 
// Error messages
// Media metadata, codecs codec setting, bandwidth and media types
// Key data used to establish secure connections
// Network data, such as host's IP address and port as seen by the outside world

module.exports = router;
