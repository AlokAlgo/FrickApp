var request = require('request');
var cheerio = require('cheerio');

var parseScore = require('./matchScoreParse');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Match = require('./models/match');
var News =  require('./models/news');
var external_id = '951371';
function updateMatch() {
	
request('http://www.espncricinfo.com/icc-world-twenty20-2016/engine/match/951371.html', function (error, response, html) {
	
  if (!error && response.statusCode == 200) {
	var $ = cheerio.load(html);
	var title = $('title').text();
	var parts = title.split('|');
	var matchscore = parts[0].slice(0,parts[0].length - 1);
	console.log(matchscore);
            // Data reception is done, do whatever with it!
	var prevScore = '';
	Match.findOne( { external_id : external_id }, function(err, matchBeforeUpdate) {
	var prevScore = matchBeforeUpdate.score;
	Match.findOneAndUpdate( {external_id: external_id},{score : matchscore}, function(err,match) {
		if (err) {
			console.log(err);
		}
			
		// here it should generate news if scores differ
		var prevData = parseScore.getMatchScore(prevScore);
		var curData =  parseScore.getMatchScore( matchscore);
		console.log("Prev" + prevData.text);
		console.log("Curre" + curData.text);
		// get both Match Scores
		// if scores are same don't do anything
		if ( !(prevData.text == curData.text))
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
	}); // end find One
} //end function
}); // end request
} // end update Match
setInterval(updateMatch,20000);
