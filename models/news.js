var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;

// create a schema
var newsSchema = new Schema({
	match_id: { type:String, required :true },
	newsType: { type: String, required: true},
	moreflag : { type:Boolean, required:true},
	val: {type: String},
	created_at: Date,
	updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var News = mongoose.model('News', newsSchema);
// after news save meesage shd be published
// make this available to our newss in our Node applications
var Toproom = require('./topicsubjectroom');
var Match = require('./match');
var MatchedBet = require('./matchedbet');
var SettledBet = require('./settledbet');
var User = require('./user');
newsSchema.post('save', function(doc) {
	console.log('%s has been saved', doc._id);
  // use the subject flag to decide which bets qualify for settlement also take care of non numeric val (eg Match win loose scenario)
	var query = MatchedBet.find({});
	
	if ( !doc.moreflag )  {
		// TO DO here all the unmatched bets should be invalidated
		query.where('newsType', doc.newsType).where('settled', false).
		 where('match_id', doc.match_id);
	} else {
		query.where('newsType', doc.newsType).where('settled', false)
		 .where('match_id', doc.match_id)
		.where('val').lte(doc.val);
	}

	query.exec(function (err, bets) {
		if (err)
		console.log(err);
		bets.forEach(function(bet) {
		// the matched bet settled flag shd be set to true
		
		// now settle the bet
			var pessimistId = bet.create_user_id == bet.optimistic_user_id ? bet.match_user_id : bet.create_user_id;
			var winner;
			var looser;
			if (bet.val) {
			var winner = doc.val >= bet.val ? bet.optimistic_user_id : pessimistId;
			var looser = doc.val >= bet.val ? pessimistId : bet.optimistic_user_id;
			} else {
				winner = doc.val == 'true' ? bet.optimistic_user_id : pessimistId;
				looser = doc.val == 'true' ? pessimistId : bet.optimistic_user_id;
			}
			
			var settledbet = new  SettledBet(
			{
				match_id : bet.match_id,
				create_user_id : bet.create_user_id,
				match_user_id : bet.match_user_id,
				win_user_id : winner,
				loose_user_id : looser,
				optimistic : doc.optimistic,
				optimistic_user_id : bet.optimistic_user_id,
				coins : doc.create_user_id == winner ? bet.coinstake : bet.coinsgive,
				resultVal : doc.val,
				newsType : doc.newsType,
				val : bet.val ? bet.val : ' '
			});
			settledbet.save(function(err,setbet) {
				if (err)
					console.log(err); 
				// here the matched 
				User.findOne({'user_id' : setbet.win_user_id}, function (err, user) {
					if (err) 	
					console.log(err);
					user.coins = user.coins + setbet.coins;
					user.coinslocked = user.coinslocked - setbet.coins;
					user.save();
				});
				User.findOne({'user_id' : setbet.loose_user_id}, function (err, user) {
					if (err) 	
					console.log(err);
					user.coins = user.coins - setbet.coins;
					user.coinslocked = user.coinslocked - setbet.coins;
					user.save();
				});
				
			}); // end save
			
				bet.settled = true;
				console.log("The bet is settled" );
				bet.save();
		});// end for each
	}); // end query exec

//get the subjet and topic from news Type
var newsType = doc.newsType;
var pos = newsType.lastIndexOf(" ");
var moreflag = doc.moreflag;

var subject = newsType.slice(0,pos);
var topicname =newsType.slice(pos+1,newsType.length);

console.log("pos save news" + "subject " + subject + "topic " + topicname);

var match_id = doc.match_id;
//  here all the unmatched bets should be invalidated if more flag is false for this match and this subject and Topic
if (!doc.moreflag) {
var topQuery = Toproom.find({match_id : match_id, valid : true, subject: subject, topicname : topicname});
topQuery.exec(function(err, unmatchedbets) {
	unmatchedbets.forEach(function(unmatchedbet) {
		
		unmatchedbet.valid = false;
		unmatchedbet.save(function(err, data) {
			if (err) {
				console.log(err);
			}
		}); // end save
		
	}); // end forEach
}); // end exec
}// end if more flag

var subjectfound = false;
var matchQuery = Match.findOne({_id : match_id});
matchQuery.exec(function(err, match) {
	var metadata = match.metadata;
	metadata.forEach(function(data) {
	console.log("subject " + subject + "dataanme "  + data.name);
	if ( data.name === subject)	{
		console.log("insubject " + subject + "indataanme "  + data.name);
		var topics = data.topics;
		topics.forEach(function(topic) {
			console.log("topic " + topic.name + "topicname "  + topicname);
			if (topic.name == topicname) {
				topic.val = doc.val;
				topic.isLive = doc.moreflag;
				match.update({metadata : metadata},function(err,match) {
					if (err) {
						console.log(err);
					}
				});
			} // end if
		}); //end topic forEach
	} //end if
	}); // end for each metadata
});// end query exec

// If Subject is not there in Match Metadata then it should be pushed async module needs to be used
}); // end post save
module.exports = News;