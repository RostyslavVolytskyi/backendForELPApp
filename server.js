var express = require('express');
var config = require('./config');
var app = express();


app.listen(config.port, function () {
  console.log(`Example app listening on port ${config.port}!`);
})