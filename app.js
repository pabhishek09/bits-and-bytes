var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var onIoConnect = require('./server/socket/index');
var cors = require('cors');

var api = require('./server/api');

var app = express();
var server = http.createServer(app);

var io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000'],
  },
  path: '/signal/'
});
io.on('connection', onIoConnect);

app.use(cors('http://localhost:3000'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api);

module.exports = server;
