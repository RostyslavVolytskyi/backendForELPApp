let mongoose = require('mongoose');
const User = require('../models/user');

let Schema = mongoose.Schema;

let MealSchema = new Schema({
  _creator :        {type: Schema.Types.ObjectId, ref: 'User' },
  name:             {type: String, required: true},
  description:      String,
  selected:         {type: Boolean, default: false},
  imageUrl:         String,
  portion:          [{
                       size: String,
                       portionSelected: {type: Boolean, default: false},
                       portionDescription: String,
                       price: Number,
                       weight: Number
                    }]
});

module.exports = mongoose.model('Meal', MealSchema);