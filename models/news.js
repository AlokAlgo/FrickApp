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
var MatchedBet = require('./matchedbet');
var SettledBet = require('./settledbet');
var User = require('./user');
newsSchema.post('save', function(doc) {
	console.log('%s has been saved', doc._id);
  // use the subject flag to decide which bets qualify for settlement also take care of non numeric val (eg Match win loose scenario)
	var query = MatchedBet.find({});
	
	if ( !doc.moreflag )  {
		query.where('newsType', doc.newsType).
		 where('match_id', doc.match_id);
	} else {
		query.where('newsType', doc.newsType)
		 .where('match_id', doc.match_id)
		.where('val').lte(doc.val);
	}

	query.exec(function (err, bets) {
		if (err)
		console.log(err);
		bets.forEach(function(bet) {
		// now settle the bet
			var pessimistId = bet.create_user_id == bet.optimistic_user_id ? bet.match_user_id : bet.create_user_id;
			var settledbet = new  SettledBet(
			{
				match_id : bet.match_id,
				create_user_id : bet.create_user_id,
				match_user_id : bet.match_user_id,
				win_user_id : doc.val >= bet.val ? bet.optimistic_user_id : pessimistId,
				loose_user_id : doc.val >= bet.val ? pessimistId : bet.optimistic_user_id,
				optimistic : doc.optimistic,
				optimistic_user_id : bet.optimistic_user_id,
				coins : bet.coinsgive,
				resultVal : doc.val,
				newsType : doc.newsType,
				val : bet.val
			});
			settledbet.save(function(err,setbet) {
				if (err)
					console.log(err); 
				User.findOne({'user_id' : setbet.win_user_id}, function (err, user) {
					if (err) 	
					console.log(err);
					user.coins = user.coins + setbet.coins;
					
				});
				User.findOne({'user_id' : setbet.loose_user_id}, function (err, user) {
					if (err) 	
					console.log(err);
					user.coins = user.coins - setbet.coins;
					
				});
			
			}); // end save
		
		});// end for each
	}); // end query exec
	
}); // end post save
module.exports = News;