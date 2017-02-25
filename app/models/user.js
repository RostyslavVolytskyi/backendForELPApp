let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true, select: false},
  email: {type: String, required: true, unique: true},
  created: { type: Date, default: Date.now },
});

UserSchema.pre('save', function (next) {

  let user = this;
  if(!user.isModified('password')) return next(); // only hash the password if it has been modified (or is new)

  bcrypt.hash(user.password, null ,null, (err, hash) =>{
    if(err) return next(err);
    user.password = hash; // override the cleartext password with the hashed one
    next();
  });
});

UserSchema.methods.comparePassword = function (password) {
  let user = this;
  return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', UserSchema);