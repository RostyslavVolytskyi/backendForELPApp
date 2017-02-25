let User = require('../models/user');
let jsonwebtoken = require('jsonwebtoken');
let config = require('../../config');

let secretKey = config.secretKey;

// Methode to create token
function createToken(user){
  var token = jsonwebtoken.sign({
    id: user._id,
    username: user.username
  }, secretKey, {
    expiresIn: '1h'
  });
  return token;
}

module.exports = (express) => {

  let api = express.Router();

  api.get('/users', function(req, res){
    User.find({}, function(err, users){
      if(err) {
        res.send(err);
        return;
      }
      res.json(users);
    });
  });

  //Post to DB
  api.post('/signup', function(req, res){

    let user = new User({
      username:           req.body.username,
      email:              req.body.email,
      password:           req.body.password,
      registrationTime:   req.body.registrationTime,
      registrationType:   req.body.registrationType,
      accountType:        req.body.accountType,
      location:           req.body.location
    });

    let token = createToken(user);

    if( req.body.username === null || req.body.username === '' ||
        req.body.password === null || req.body.password === '' ||
        req.body.email === null    || req.body.email === '') {
      res.send('Ensure username, password and email were provided!');
    } else {
      user.save( (err) => {
        if(err) {
          res.send(err);
          return;
        }
        res.json({
          success: true,
          message: `${user.username} was created with email: ${user.email}! Thanx for registration!`,
          token
        });
      });
    }

  });

  // Middleware to verify token
  api.use(function(req, res, next){
    console.log("Somebody just came to our app!");
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
      jsonwebtoken.verify(token, secretKey, function(err, decoded){
        if(err){
          res.status(403).send({success: false, message: "Failed to authrntificate user"});
        }else{
          req.decoded = decoded;
          next();
        }
      });
    } else{
      res.status(403).send({success: false, message: "No Token Provided"});
    }
  });

  return api;
}