const User = require('../models/user');
const Upload = require('../models/upload');
const multer = require('multer');
const upload = multer({
    dest: './uploads'
}).any();
const fs = require('fs');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../config');
const secretKey = config.secretKey;

// Methode to create token
function createToken(user) {
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

    // Get all users
    api.get('/users', function (req, res) {
        User.find({}, function (err, users) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(users);
        });
    });

    // Post to DB
    api.post('/signup', function (req, res) {
        if (req.body.username === null || req.body.username === '' ||
            req.body.password === null || req.body.password === '' ||
            req.body.email === null || req.body.email === '') {
            res.send('Ensure username, password and email were provided!');
        } else {
            let user = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                registrationTime: req.body.registrationTime,
                registrationType: req.body.registrationType,
                accountType: req.body.accountType,
                location: req.body.location,
                map: req.body.map
            });

            let token = createToken(user);


            user.save((err) => {
                if (err) {
                    console.log(err)
                    res.send(err);
                    return;
                }
                console.log('Sucess Adding user')
                res.json({
                    user: user,
                    success: true,
                    message: `${user.username} was created with email: ${user.email}! Thanx for registration!`,
                    token
                });
                res.send();
            });
        }
    });

    // For login
    api.post('/login', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('username password').exec((err, user) => {
            if (err) throw err;
            if (!user) {
                res.send({
                    message: "User doesn't exist"
                });
            } else if (user) {
                let validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.send({
                        message: "Invalid Password"
                    });
                } else {
                    //token
                    var token = createToken(user);
                    res.json({
                        success: true,
                        message: "Successfully login",
                        token: token
                    });
                }
            }
        });
    });

    // Middleware to verify token
    api.use(function (req, res, next) {
        console.log("Somebody just came to our app!");
        console.log(req.body)
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jsonwebtoken.verify(token, secretKey, function (err, decoded) {
                if (err) {
                    res.status(403).send({
                        success: false,
                        message: "Failed to authrntificate user"
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(403).send({
                success: false,
                message: "No Token Provided"
            });
        }
    });

    api.post('/upload', function (req, res) {
        upload(req, res, function (err) {
            if (err) {
                res.send(err);
                return;
            }

            let fileUpload = new Upload();
            fileUpload.img.data = fs.readFileSync(req.files[0].path);
            fileUpload.img.contentType = req.files[0].mimetype;
            fileUpload.img.path = req.files[0].path;
            fileUpload.save((err) => {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json({
                    success: true,
                    message: `File saved to DB`
                });
            });
        })
    })

    return api;
}