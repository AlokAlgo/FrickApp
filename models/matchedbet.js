var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;

// create a schema
var matchedbetSchema = new Schema({
  match_id: {type: String, required : true},
  create_user_id: {type: String, required : true, index : true},
  match_user_id: {type: String, required : true, index : true},
  newsType: {type: String, required : true},
  val: {type: Number, index : true},
  optimistic_user_id : {type: String, required : true},
  coinsgive: {type: Number, required : true},
  coinstake: {type: Number},
  created_at: Date,
  updated_at: Date
});
//coins give and take are related to create userid
// News Type is like subject topic , P1, Over31
// the schema is useless so far
// we need to create a model using it
var MatchedBet = mongoose.model('MatchedBet', matchedbetSchema);

matchedbetSchema.post('save', function(doc) {
  console.log('matchedbet' + '%s has been saved', doc._id);
  // here the message shd be published to redis
});

// make this available to our matchedbets in our Node applications
module.exports = MatchedBet;