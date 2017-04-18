let mongoose = require('mongoose');
const User = require('../models/user');

let Schema = mongoose.Schema;

price: number = 0;
weight: number = 0;

let PortionSchema = new Schema({
    size: {
        type: String,
        required: true
    },
    description: String,
    selected: {
        type: Boolean,
        default: false
    },
    price: Number,
    weight: Number
});

let MealSchema = new Schema({
    _creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    selected: {
        type: Boolean,
        default: false
    },
    imageUrl: String,
    portions: [PortionSchema]
});

module.exports = mongoose.model('Meal', MealSchema);
