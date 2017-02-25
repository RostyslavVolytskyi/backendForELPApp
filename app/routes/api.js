let User = require('../models/user');

module.exports = (express) => {

  let api = express.Router();

  api.post('/login', (req, res) => {
    res.send('you are logined');
  })

  return api;
  }