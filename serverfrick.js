var express = require('express');
var app=express();
const mongoose = require('mongoose');
const redis = require('redis');
var http = require('http').Server(app);
var jwt  = require('jsonwebtoken');
var jwtdecode  = require('jwt-decode');
var io = require('socket.io')(http);
var socketioJwt = require('socketio-jwt');
var dotenv = require('dotenv');
mongoose.connect('mongodb://localhost/test');
var path = require('path');
var bodyParser = require('body-parser');
var User = require('./models/user');
var Toproom = require('./models/topicsubjectroom');

dotenv.load();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
}

app.set('views', __dirname + '/');
//app.set('view engine', 'jade');
app.use(bodyParser.json());
/* commenting for now will be used in future
io
	.on('connection', socketioJwt.authorize({
		secret: Buffer(JSON.stringify(process.env.AUTH0_CLIENT_SECRET), 'base64'),
		timeout: 15000 // 15 seconds to send the authentication message
	}))
	
	.on('authenticated', function(socket){
		console.log('connected & authenticated: ' + JSON.stringify(socket.decoded_token));
		var decoded = socket.decoded_token;
		console.log(decoded.sub );
		var user = User.findOne({user_id:decoded.sub});
		console.log("here befor user creation ");
		if (user != null && user !== undefined) {
			console.log("user is not there");
			
			var newUser = new User({user_id:decoded.sub, coins : '100',coinslocked:'0'});
			newUser.save(function(err) {
				if (err)
					console.log(err);
			});
			console.log("here after user creation ");
		} 
		// this shd be published to intelligent systems to see if User creation is needed
		socket.on('chat message', function(msg){
			debugger;
			console.log(msg);
			io.emit('chat message', msg);
		});
	})
	*/
app.use(express.static(__dirname + '/'));
app.post("/login" , function (req, res) {
	 var token = req.body.token;
	 console.log(token);
	 var decoded = jwtdecode(token);
	 console.log(decoded);
	 User.findOne({user_id:decoded.sub},function(err,user) {
		 if (err) {
		 console.log(err);
		 }
		 if (user == null) {
			 console.log("new User getting created");
			 var newUser = new User({user_id:decoded.sub, coins : '100',coinslocked:'0'});
			 newUser.save(function(err, newUser) {
				if (err) {
					console.log(err);
				} 
					res.send(newUser);
			});
		 } else {
			 res.send(user);
		 }
	 }); 
}) // end post
	




http.listen(3001, function(){
	console.log('listening on *:3001');
});