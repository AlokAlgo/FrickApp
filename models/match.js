var mongoose = require('mongoose');
//mongoose.createConnection('mongodb://localhost/test');
var Schema = mongoose.Schema;

// create a  match schema
var matchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  location:{ type: String, required: true },
  score: { type: String, required: true },
  external_id : { type : String},
  metadata: [Schema.Types.Mixed],
  live : {type: Boolean},
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Match = mongoose.model('Match', matchSchema);

// make this available to our matchs in our Node applications

module.exports = Match;