var express = require('express')
,	http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');

// variable port for Heroku
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



// websockets
io.sockets.on('connection', function(socket) {
	console.log('Socket connected: ' + socket.id);

	socket.emit('message', {data: 'Hello from the server!'});

	socket.on('message', function(msg){

		console.log('Message received: ' + JSON.parse(msg.data));
	});

	socket.on('disconnect', function(){
		console.log('Socket disconnected: ' + socket.id);
		//do something
	});
});