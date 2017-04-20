const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  fullName:         {type: String, required: true},
  email:            {type: String, required: true},
  message:          {type: String, required: true},
  ip:               String,
  date:             {type: Date, default: Date.now}
});

module.exports = mongoose.model('Contact', ContactSchema);