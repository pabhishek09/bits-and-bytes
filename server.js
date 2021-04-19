var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var cors = require('cors');

var indexRouter = require('./routes/index');

var app = express();
var httpServer = http.createServer(app);
var io = socketio(httpServer, {path: '/signal/'})

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
io.on('connection', (socket) => {
  console.log('Connection established', socket);
})

httpServer.listen('4000');

module.exports = app;
