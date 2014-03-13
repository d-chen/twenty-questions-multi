var express = require('express')
,	http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var socket = require('./server-socket');

// variable port for Heroku hosting
var port = Number(process.env.PORT || 5000);
server.listen(port);

// serve static resources
app.use('/css', express.static( path.resolve(__dirname + '/../app/css')));
app.use('/lib', express.static( path.resolve(__dirname + '/../app/lib')));
app.use('/js', express.static( path.resolve(__dirname + '/../app/js')));

// routing
app.get('/', function(req, res){
	res.sendfile( path.resolve(__dirname + '/../app/index.html') );
});

// handle socket connections
io.sockets.on('connection', socket);

