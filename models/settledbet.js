var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;

// create a schema
var settledbetSchema = new Schema({
  match_id: {type: String, required : true, index : true},
  create_user_id: {type: String, required : true, index : true},
  match_user_id: {type: String, required : true, index : true},
  newsType: {type: String, required : true},
  val: {type: String, required : true},
  optimistic_user_id : {type: String, required : true},
  coins: {type: Number, required : true},
  resultVal: {type: String, required : true},
  win_user_id: {type: String, required : true},
  loose_user_id: {type: String, required : true},
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var SettledBet = mongoose.model('SettledBet', settledbetSchema);

// make this available to our settledbets in our Node applications
module.exports = SettledBet;