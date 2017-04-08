let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let MealSchema = new Schema({
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