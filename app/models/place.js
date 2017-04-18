let mongoose = require('mongoose');
const User = require('../models/user');

let Schema = mongoose.Schema;

let PlaceSchema = new Schema({
    _creator: {
        type:       Schema.Types.ObjectId,
        ref:        'User'
    },
    name: {
        type:       String,
        required:   true
    },
    googleId:       String,
    email:          String,
    phone:          String,
    address:        String,
    country:        String,
    city:           String,
    website:        String,
    location:       Schema.Types.Mixed,
});

module.exports = mongoose.model('Place', PlaceSchema);
