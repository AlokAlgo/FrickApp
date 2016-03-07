var redis = require('redis');
var client = redis.createClient();
client.on('message', function(channel, message){
  var data = JSON.parse(message)
  switch (data.type) {
    case 'create':
      var userID = data._id
      //send 'Hello' email
    case 'update':
      var userID = data._id
      //do smth
  }
});

client.subscribe('user');