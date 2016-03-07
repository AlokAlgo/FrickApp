var express = require('express');
var app=express();
const mongoose = require('mongoose');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socketioJwt = require('socketio-jwt');
var dotenv = require('dotenv');
var Order = require('./models/order');
mongoose.connect('mongodb://localhost/test');
  
// create a new user called chris

dotenv.load();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
}

app.set('views', __dirname + '/public');
app.set('view engine', 'jade');

io
	.on('connection', socketioJwt.authorize({
		secret: Buffer(JSON.stringify(process.env.AUTH0_CLIENT_SECRET), 'base64'),
		timeout: 15000 // 15 seconds to send the authentication message
	}))
	
	.on('authenticated', function(socket){
		console.log('connected & authenticated: ' + JSON.stringify(socket.decoded_token));
		socket.on('chat message', function(msg){
			debugger;
			
			// if msg contains "BU BUY" or "BU SELL" (e.g., "BU BUY LINE1 10 AT 108", etc.)
			// msg.split(':') etc. to populate order fields
			// match existing order or push into orders 
			// respond appropriatelya
var order = new Order({
  userid: 'Chris',
  username: 'sevilayha',
  password: 'password' 
});

order.save(function(err) {
  if (err) throw err;

  console.log('User saved successfully!');
});

			console.log(msg);
			io.emit('chat message', msg);
		});
	})
	
app.use(express.static(__dirname + '/public'));
	
app.get('/', function (req, res) {
	//res.sendFile('index.html', { root: "." + "/" } );
  res.render('index',
  { env: env }
  
  )
})	

http.listen(3001, function(){
	console.log('listening on *:3001');
});