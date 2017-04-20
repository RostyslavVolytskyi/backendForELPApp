const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuickEmailSchema = new Schema({
  email:            {type: String, required: true},
  date:             {type: Date, default: Date.now},
  ip:               String,
  route:            String
});

module.exports = mongoose.model('QuickEmail', QuickEmailSchema);