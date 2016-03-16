const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const restify = require('express-restify-mongoose');
const app = express();
const router = express.Router();
app.use(router);
var jwt  = require('jsonwebtoken');
var auth = require('./auth.js');
router.use(bodyParser.json());
app.use(methodOverride());

router.use(function(req, res, next) {  
    res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    // we have added this Access-Control-Allow-Headers option
    res.header('Access-Control-Allow-Headers', "X-Requested-With, Content-Type, Authorization");
    if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});
/*app.all('/api/v1/*', function (req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, process.env.AUTH0_CLIENT_SECRET, 
		function(err, decoded) {      
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });    
			} else {
        // if everything is good, save to request for use in other routes
			req.decoded = decoded;    
			next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
		});
    
	}
	});*/
 

mongoose.connect('mongodb://localhost/test');
app.post('/login', auth.login);
var Match = require('./models/match');
var User = require('./models/user');
var Toproom = require('./models/topicsubjectroom');
var MatchedBet = require('./models/matchedbet');
var SettledBet = require('./models/settledbet');
var News = require('./models/news');

restify.serve(router, User);
restify.serve(router, Match);
restify.serve(router, Toproom);
restify.serve(router, MatchedBet);
restify.serve(router, SettledBet);
restify.serve(router, News);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
 
app.listen(3002, function () {
  console.log('Express server listening on port3002');
})