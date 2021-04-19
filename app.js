var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var onIoConnect = require('./server/socket/index');
// var cors = require('cors');

var router = require('./server/api/index');
import router from './server/api';

var app = express();
var server = http.createServer(app);

var io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000'],
  },
  path: '/signal/'
});
io.on('connection', onIoConnect);

// app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', router);

module.exports = server;
