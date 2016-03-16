var http = require('http');
var parseScore = require('./matchScoreParse');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Match = require('./models/match');
var News =  require('./models/news');
var external_id = '951331';

var options = {
  host: 'cricscore-api.appspot.com',
  port: '',
  path: '/csa?id='+external_id
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
			console.log(parsed[0].de);
			var prevScore = '';
			Match.findOne( { external_id : external_id }, function(err, matchBeforeUpdate) {
			var prevScore = matchBeforeUpdate.score;
			Match.findOneAndUpdate( {external_id: external_id},{score : parsed[0].de}, function(err,match) {
				if (err) {
					console.log(err);
				}
			
				// here it should generate news if scores differ
				var prevData = parseScore.getMatchScore(prevScore);
				var curData =  parseScore.getMatchScore( parsed[0].de);
				console.log("Prev" + prevData.text);
				console.log("Curre" + curData.text);
				// get both Match Scores
				// if scores are same don't do anything
				if ( !(prevData.text === curData.text))
				{
					// forEach Batsman in Score1
					prevData.batsmen.forEach(function(batsman) {
					   // if it is not present in Score2
					   if (curData.text.indexOf(batsman.name) < 0) {
					     // publish a news for the batsman with More flag false
						 var news = new News( { match_id: match._id, newsType : batsman.name + ' ' + 'Score', moreflag : false, val : (batsman.score.slice(0,batsman.score.length -1))}) ;
						 console.log("Before publishing news, Batsman Got Out");
						news.save(function(err) {
							if (err)
							console.log(err);
							});
							}
					}); // end forEach 
					// forEach Batsman in Score 2
					curData.batsmen.forEach(function(batsman) {
					   // if it is live
					   if (batsman.live) {
					     var news = new News({match_id: match._id, newsType : batsman.name + ' ' + 'Score' , moreflag:true, 
						 val: batsman.score.slice(0, batsman.score.length -1)});
						 console.log("Before publishing news, Playing batsman Score");
						 news.save(function(err) {
							if (err)
							console.log(err);
							});
						 
					   } // end if batsan live
					}); //end for Each
							
				} // end if
			}); // end findAndUpdate
			});
}); // end rresp

}); // end http get
} //end updateMatch

setInterval(updateMatch,10000);