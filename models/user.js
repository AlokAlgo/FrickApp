var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  user_id: { type : String, required: true, unique: true, index: true},
  name: String,
  emailId: { type: String},
  coins: {type : Number},
  password: { type: String},
  admin: Boolean,
  location: String,
  meta: {
    age: Number,
    website: String
  },
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;