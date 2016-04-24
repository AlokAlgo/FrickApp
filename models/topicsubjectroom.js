var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;

// create a schema
var topicSchema = new Schema({
  match_id: { type: String, required: true , index: true },
  create_user_id: { type: String, required: true, index: true },
  match_user_id: { type: String},
  topicname: { type: String, required: true, index: true },
  subject : { type: String, required: true, index: true },
  optimistic: { type : Boolean, required: true },
  coinsgive: { type: Number, required: true },
  coinstake:  { type: Number, required: true},
  val:  { type: Number, index: true } ,
  valid : {type : Boolean, default: true },
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
// valid false means it hasnot been matchejd yet
// message shd be published for the processor
var Toproom = mongoose.model('Toproom', topicSchema);

var MatchedBet = require('./matchedbet');
var User = require('./user');

topicSchema.post('remove', function(doc) {
	console.log("bet got deleted ");
    User.findOneAndUpdate({'user_id' : doc.create_user_id}, { $inc: {  coinslocked: -doc.coinsgive  } }, function(err, user) {
						if (err) {
							console.log(err);
						}
					});
});

topicSchema.post('save', function(doc) {
  console.log('%s has been saved', doc._id);
  // find if something matches
  // and updae accordingly
  // find the userid and update blocked coins
  // This also shd be findAndUpdate 
  User.findOneAndUpdate({'user_id' : doc.create_user_id}, { $inc: {  coinslocked: doc.coinsgive  } }, function(err, user) {
						if (err) {
							console.log(err);
						}
					});
  Toproom.findOneAndUpdate(
  {
	  topicname : doc.topicname,
	  subject : doc.subject,
 	  optimistic : !doc.optimistic ,
	  val : doc.val,
	  coinsgive : doc.coinstake,
	  coinstake : doc.coinsgive,
	  match_id : doc.match_id,
	  valid : true
  }, {valid : false, match_user_id: doc.create_user_id } , function(err, topic) {
		if (err)
			console.log(err);
		if (topic) {
		Toproom.findOneAndUpdate( {_id : doc._id}, {valid : false}, function(err, topic) {
			if (err)
			console.log(err);
		});
		var matchedbet = new  MatchedBet(
		{
			match_id : topic.match_id,
			create_user_id : topic.create_user_id,
			match_user_id : doc.create_user_id,
			optimistic_user_id : topic.optimistic == true ? topic.create_user_id : doc.create_user_id,
			newsType  : topic.subject + ' ' + topic.topicname, 
			optimistic : doc.optimistic, 
			coinsgive : doc.coinsgive,
			coinstake : doc.coinstake,
			val : doc.val
		});
		matchedbet.save(function(err) {
				if (err) 
					console.log(err);
			});
		 
  }
  })
  // here the message shd be published
}); // end post

// make this available to our batrooms in our Node applications
module.exports = Toproom;