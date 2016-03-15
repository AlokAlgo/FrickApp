var http = require('http');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');


var options = {
  host: 'cricscore-api.appspot.com',
  port: '',
  path: '/csa?id=951329'
};
function updateMatch() {
// it shd get all the live matches
// for each match
	// get the external_id
	// create options var with id
	
	
http.get(options, function(resp){
	var body = '';

resp.on('data', function(chunk){
    //do something with chunk
	body += chunk;
  });
  
resp.on("error", function(e){
  console.log("Got error: " + e.message);
});

resp.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
			// here it shd call the process method which will do all the processing
			console.log(parsed);
			Match.findOneAndUpdate( {external_id: '951329'},{score : parsed.de}, function(err,match) {
				if (err) {
					console.log(err);
				}
			});
});

});
}

setInterval(updateMatch,30000);