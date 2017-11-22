const mongoose = require('mongoose');
const extend = require('mongoose-schema-extend');
const User = require('../models/meal');
const Schema = mongoose.Schema;

const PlaceRatings = new Schema({
    placeId: String,
    rating: Number
});

const UserMassages = new Schema({
    userId: String,
    massage: String,
    date: Date
});

const AppUserSchema = User.extend({
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    favoriteMeals: [{
        type: Schema.Types.ObjectId,
        ref: 'Meal'
    }],
    placeRatings: [PlaceRatings],
    meassages: [UserMassages]

});

module.exports = mongoose.model('AppUser', AppUserSchema);
