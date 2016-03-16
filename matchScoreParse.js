
//var score = "SL 41/2 (6.0 ov, HDRL Thirimanne 10*, CK Kapugedera 1*, Wahab Riaz 0/18)";


//var MatchScore = getMatchScore(score);
//console.log(JSON.stringify(MatchScore)		);	


exports.getMatchScore = function (score) {
var MatchScore = {};
MatchScore.batsmen = [];
MatchScore.text = score;
// get the Index of first (
var posStart = score.indexOf("(");

// fetch the data before (
var teamData = score.slice(0,posStart);
	//split with  " "
	var splitResult = teamData.split(" ");
	//first token is Team
	var teamName = splitResult[0];
	MatchScore.teamName = teamName;
	//get the second token split with /
	var scoreWickets = splitResult[1];
		//first token is score
		splitResult = scoreWickets.split("/");
		var scoreOnly = splitResult[0];
		var wickets =  splitResult[1];
		//second token is wicket
		MatchScore.score = scoreOnly;
		MatchScore.wickets = wickets;

// get the index of )
var posEnd = score.indexOf(")");
// get the contentents between ( and )
var details = score.slice(posStart, posEnd);
	// split with ,
	splitResult = details.split(",");
		// first token is overs
		var overs = splitResult[0];
		// if second token doesn't contain / its a batsman score
		for (i = 1;i < splitResult.length ; i++)
		{
			var data = splitResult[i];
			// if batsman
			if (data.indexOf("/") < 0) {
			var batsMan = {};
				// getlast Index of " "
			var divider = data.lastIndexOf(" ");
			// before the Index is Battsman Name
			var batName = data.slice(1, divider);
			batsMan.name = batName;
			// after the Index is scorej
			var batScore = data.slice(divider+1, data.length);
			batsMan.score = batScore;
			// If score contains * batsman islive
			if (batScore.indexOf("*") > -1 ) {
				batsMan.live = true;
			}
			MatchScore.batsmen.push(batsMan);
			}
		}
return MatchScore;
}
			
