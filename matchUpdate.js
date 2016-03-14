var http = require('http');

var options = {
  host: 'cricscore-api.appspot.com',
  port: '',
  path: '/csa?id=971709'
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
});

});
}

setInterval(updateMatch,30000);