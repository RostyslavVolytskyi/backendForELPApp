let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
  name: String,
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true, select: false},
  email: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('User', UserSchema);