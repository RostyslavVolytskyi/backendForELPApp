let mongoose = require('mongoose');
const User = require('../models/user');
const Meal = require('../models/meal');

let Schema = mongoose.Schema;

const CurrencySchema = new Schema({
    name: String,
    postfix: String
});

const ElpOpeningHours = new Schema({
    break: {
        from:           String,
        fromMin:        String,
        to:             String,
        toMin:          String
    },
    business_hours: {
        from:           String,
        fromMin:        String,
        to:             String,
        toMin:          String
    },
    hasBreak:           Boolean,
    name:               String,
    selected:           Boolean
});

const PaymentOptions = new Schema({
    image:              String,
    name:               String,
    selected:           Boolean
});

const PortionPrices = new Schema({
    portionId:           String,
    price:               Number
});

const PlaceSchema = new Schema({
    _creator: {
        type:           Schema.Types.ObjectId,
        ref:            'User'
    },
    name: {
        type:           String,
        required:       true
    },
    googleId:           String,
    email:              String,
    phone:              String,
    fullAddress:        String,
    website:            String,
    currency:           CurrencySchema,
    elpOpeningHours:    [ElpOpeningHours],
    location:           Schema.Types.Mixed,
    meals:             { type : Array , 'default' : [] },
    deliveryAvailable:  Boolean,
    takeAwayAvailable:  Boolean,
    paymentOptions:     [PaymentOptions],
    date:               {type: Date, default: Date.now},
    rating:             Number
});

module.exports = mongoose.model('Place', PlaceSchema);
