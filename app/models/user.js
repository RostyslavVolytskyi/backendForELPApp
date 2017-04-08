let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

const Meal = require('../models/meal');

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  firstName:        {type: String, required: true},
  lastName:         {type: String, required: true},
  email:            {type: String, required: true, unique: true},
  password:         {type: String, required: true, select: false},
  registrationTime: {type: Date, default: Date.now},
  registrationType: String,
  accountType:      {type: String, default: 'default'},
  location:         Schema.Types.Mixed,
  image:            String,
  meals :           [{ type: Schema.Types.ObjectId, ref: 'Meal' }]
});

UserSchema.pre('save', function (next) {
  let user = this;
  if(!user.isModified('password')) return next(); // only hash the password if it has been modified (or is new)

  bcrypt.hash(user.password, null, null, (err, hash) => {
    if(err) return next(err);
    user.password = hash; // override the cleartext password with the hashed one
    next();
  });
});

UserSchema.methods.comparePassword = function (password) {
  let user = this;
  return bcrypt.compareSync(password, user.password);
}

UserSchema.methods.getUserData = function (password) {
  this.password = '';
  return this;
}

module.exports = mongoose.model('User', UserSchema);
