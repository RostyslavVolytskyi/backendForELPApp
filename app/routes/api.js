let User = require('../models/user');

module.exports = (express) => {

  let api = express.Router();

  //Post to DB
  api.post('/signup', function(req, res){

    let user = new User({
      username: req.body.username,
      password: req.body.password,
      email:    req.body.email,
      created:  req.body.created
    });

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
          message: `${user.username} was created with email: ${user.email}`
        });
      });
    }

  });

  return api;
}