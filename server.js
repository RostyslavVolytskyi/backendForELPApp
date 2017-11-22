const express = require('express');
const config = require('./config');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const api = require('./app/routes/api')(express);
const path = require('path');
const cors = require('cors')
const originsWhitelist = [
    'https://eatlikeproweb.herokuapp.com',
    'http://localhost:8100',
    'http://localhost:3000' //this is front-end url for development
];
const corsOptions = {
    origin: function (origin, callback) {
        const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
};

app.use(cors(corsOptions));

mongoose.Promise = require('bluebird');

// DB connect
mongoose.connect(config.database, (err) => {
    if (err) {
        console.log('Not connected to DB', err);
    } else {
        console.log('Connected to the database');
    }
});

app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/json
app.use(bodyParser.json()); // for parsing application/x-www-form-urlencoded

// Logs all requests to a console
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/app/index.html'));
});

// All routes are here
app.use('/api', api);

app.listen(config.port, (req, res) => {
    console.log(`ELP server app listening on port ${config.port}!`);
})
