let User = require('../models/user');

module.exports = (express) => {

  let api = express.Router();

  //Post to DB
  api.post('/signup', function(req, res){

    var user = new User({
      name:     req.body.name,
      username: req.body.username,
      password: req.body.password,
      email:    req.body.email,
    });

    user.save( (err) => {
      if(err) {
        res.send(err);
        return;
      }
      res.json({
        success: true,
        message: 'User has been created'
      });
    });
  });

  return api;
}