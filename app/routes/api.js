const User = require('../models/user');
const Upload = require('../models/upload');
const Meal = require('../models/meal');
const Place = require('../models/place');
const Contact = require('../models/contact');
const QuickEmail = require('../models/quickemail');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const multer = require('multer');
let savedFileName = '';
const storage = multer.diskStorage({
        destination: './uploads',
        filename: function ( req, file, cb ) {
            savedFileName = Date.now()+file.originalname;
            cb( null, savedFileName );
        }
    }
);

const path = require('path');
const upload = multer( { storage: storage } ).any();
const fs = require('fs');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../../config');
const secretKey = config.secretKey;
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

// create reusable transporter object using the default SMTP transport
const mailer = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: config.ELPmail,
                        pass: config.ELPpass
                    }
                });

mailer.use('compile', hbs({
    viewPath: 'app/views/email',
    extName: '.hbs'    
}))

// Methode to create token
function createToken(user) {
    const token = jsonwebtoken.sign({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        registrationTime: user.registrationTime,
        registrationType: user.registrationType,
        accountType: user.accountType,
        location: user.location,
        image: user.image
    }, secretKey, {
        expiresIn: '1h'
    });
    return token;
}

module.exports = (express) => {

    let api = express.Router();

    api.get('/uploads/:name', function (req, res) {
        res.sendFile(path.resolve(`./uploads/${req.params.name}`));
    });

    // Post to DB
    api.post('/signup', function (req, res) {
        if (req.body.firstName === null || req.body.firstName === '' ||
            req.body.lastName === null || req.body.lastName === '' ||
            req.body.password === null || req.body.password === '' ||
            req.body.email === null || req.body.email === '') {
            res.status(404).send({
                success: false,
                message: 'Ensure firstName, lastName, password and email were provided!'
            });
        } else {
            let user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                registrationTime: req.body.registrationTime,
                registrationType: req.body.registrationType,
                accountType: req.body.accountType,
                location: req.body.location,
                image: req.body.image
            });

            let token = createToken(user);

            user.save((err) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.json({
                    user: user.getUserData(),
                    success: true,
                    message: `${user.firstName} was created with email: ${user.email}! Thanx for registration!`,
                    token
                });
                res.send();
            });
        }
    });

    // For login
    api.post('/login', function (req, res) {
        User.findOne({
            email: req.body.email
        }).select('firstName lastName registrationTime registrationType accountType location image email password').exec((err, user) => {
            if (err) throw err;
            if (!user) {
                res.status(404).send({
                    success: false,
                    message: "User doesn't exist"
                });
            } else if (user) {
                let validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.status(401).send({
                        userRegistered: true,
                        success: false,
                        message: "Invalid Password"
                    });
                } else {
                    //token
                    var token = createToken(user);
                    res.json({
                        user: user.getUserData(),
                        success: true,
                        message: "Successfully login",
                        token: token
                    });
                }
            }
        });
    });

    // Send and change in DB recovery passport
    api.post('/send-recovery-pass-email', function (req, res) {
        const generatedPass = Math.random().toString(36).slice(2);

        bcrypt.hash(generatedPass, null, null, (err, hash) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            let hashPass = hash;
            // { new: true } is here to return updated user, not previous one
            User.findOneAndUpdate({ email: req.body.email}, { password: hashPass}, { new: true },
                function (err, user) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }

                if(user) {
                    mailer.sendMail({
                        from: '"Eat Like Pro 💪" <eatlikeprofessional@gmail.com>', // sender address
                        to: user.email, // list of receivers
                        subject: `Recovery pass`, // Subject line
                        template: 'recoverypass',
                        context: {
                            generatedPass: generatedPass,
                            firstName: user.firstName
                        }
                    }, function(err, info) {
                        if(err){
                            res.status(500).send(`Error: ${err}`);
                            return;
                        }
                        res.json({message: 'Recovery pass email was sent',
                                userFound: true,
                                sent: true});
                    });
                } else {
                    res.json({message: 'No user with such email was found',
                            userFound: false,
                            sent: false});
                }
            });
        });
    });

    // Send email from contact form
    api.post('/send-email', function (req, res) {

        if (req.body.fullName === null || req.body.fullName === '' ||
            req.body.email === null || req.body.email === '' ||
            req.body.message === null || req.body.message === '') {
            res.status(404).send({
                success: false,
                message: 'Ensure full name, email, and message were provided!'
            });
        } else {
            let contact = new Contact({
                fullName: req.body.fullName,
                email: req.body.email,
                message: req.body.message,
                date: req.body.date,
                ip: req.body.ip
            });

            contact.save((err) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }

                mailer.sendMail({
                    from: `"${contact.fullName} 👦🏼" <eatlikeprofessional@gmail.com>`, // sender address
                    to: config.adminMails, // list of receivers
                    subject: `Notification from user ❗️`, // Subject line
                    template: 'contactform',
                    context: {
                        message: contact.message,
                        email: contact.email,
                        fullName: contact.fullName
                    }
                }, function(err, info) {
                    if(err){
                        res.status(500).send(`Error: ${err}`);
                        return;
                    }
                    res.json({
                        contact: contact,
                        success: true,
                        message: `Messages sent to admins! Contact form: ${contact.email} with user full name: "${contact.fullName}" was saved to DB!`
                    });
                });
            });
        }
    });

    // Send quick email
    api.post('/quick-email', function (req, res) {

        let quickEmail = new QuickEmail({
            email: req.body.email,
            date: req.body.date,
            ip: req.body.ip,
            route: req.body.route
        });

        quickEmail.save((err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            mailer.sendMail({
                from: `"Anonymys 👦🏼" <eatlikeprofessional@gmail.com>`, // sender address
                to: config.adminMails, // list of receivers
                subject: `Notification from "Anonymys" user ❗️`, // Subject line
                template: 'quickemail',
                context: {
                    email: quickEmail.email
                }
            }, function(err, info) {
                if(err){
                    res.status(500).send(`Error: ${err}`);
                    return;
                }
            });

            mailer.sendMail({
                from: `"ELP 💪" <eatlikeprofessional@gmail.com>`, // sender address
                to: quickEmail.email, // list of receivers
                subject: `ELP feedback`, // Subject line
                template: 'quickemailback',
                context: {}
            }, function(err, info) {
                if(err){
                    res.status(500).send(`Error: ${err}`);
                    return;
                }
                res.json({
                    quickEmail: quickEmail,
                    success: true,
                    message: `Messages sent to admins with feedback! Quick email form: ${quickEmail.email} was saved to DB!`
                });
            });
        });
    });

    // Middleware to verify token
    api.use(function (req, res, next) {
        console.log("Somebody just came to our app!");
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jsonwebtoken.verify(token, secretKey, function (err, decoded) {
                if (err) {
                    res.status(403).send({
                        success: false,
                        message: "Failed to authentificate user"
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

    // Change password
    api.post('/change-password', function (req, res) {
        User.findOne({
            email: req.decoded.email
        }).select('password').exec((err, user) => {
            if (err) throw err;
            if (!user) {
                res.status(404).send({
                    success: false,
                    message: "User doesn't exist"
                });
            } else if (user) {
                let validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.status(401).send({
                        userRegistered: true,
                        success: false,
                        message: "Current password is not valid"
                    });
                } else {
                    bcrypt.hash(req.body.newpass, null, null, (err, hash) => {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        let hashPass = hash;
                        user.update({password: hashPass}, function (err, user) {
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.json({
                                success: true,
                                message: `Password successfully updated`
                            });
                        })
                    })
                }
            }
        });
    });

    // Upload a file
    api.post('/upload', function (req, res) {
        upload(req, res, function (err) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            let fileUpload = new Upload();
            fileUpload.file.data = fs.readFileSync(req.files[0].path);
            fileUpload.file.contentType = req.files[0].mimetype;
            fileUpload.file.path = req.files[0].path;
            fileUpload.save((err) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.json({
                    path: `${req.protocol}://${req.get('host')}/api/uploads/${savedFileName}`,
                    contentType: fileUpload.file.contentType,
                    success: true,
                    message: `File saved to DB`
                });
            });
        })
    });

    // Get all users
    api.get('/users', function (req, res) {
        User.find({}, function (err, users) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(users);
        });
    });

    // Find users by Name (regex pattern)
    api.get('/search-users/', function (req, res) {
        const rgxp = new RegExp(req.query.name, "i");
        User.find({firstName: rgxp}, function (err, users) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(users);
        });
    });

    // Delete user by ID
    api.delete('/user/:id', function (req, res) {
        User.findByIdAndRemove(req.params.id, function (err, user) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json({
                message: "User successfully deleted",
                id: user._id
            });
        });
    });

    // Find user by ID
    api.get('/user/:id', function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json({
                user: user,
                sucess: true,
                id: user._id
            });
        });
    });

    // Update user by ID
    api.put('/user/:id', function (req, res) {
        User.findByIdAndUpdate(req.params.id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            registrationTime: req.body.registrationTime,
            registrationType: req.body.registrationType,
            accountType: req.body.accountType,
            location: req.body.location,
            image: req.body.image
        }, function (err, user) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json({
                user: user,
                sucess: true,
                id: user._id
            });
        });
    });

    api.post('/add-user', function (req, res) {
        if (req.body.firstName === null || req.body.firstName === '' ||
            req.body.lastName === null || req.body.lastName === '' ||
            req.body.password === null || req.body.password === '' ||
            req.body.email === null || req.body.email === '') {
            res.status(404).send({
                success: false,
                message: 'Ensure firstName, lastName,  password and email were provided!'
            });
        } else {
            let user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                registrationTime: req.body.registrationTime,
                registrationType: req.body.registrationType,
                accountType: req.body.accountType,
                location: req.body.location,
                image: req.body.image
            });

            user.save((err) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.json({
                    user: user.getUserData(),
                    success: true,
                    message: `${user.firstName} was created with email: ${user.email}!`
                });
                res.send();
            });
        }
    });

    // Send mail (only for test purposes)
    api.get('/mail', function (req, res) {
        mailer.sendMail({
            from: '"Eat Like Pro 💪" <eatlikeprofessional@gmail.com>', // sender address
            to: config.adminMails, // list of receivers
            subject: `Change your life 🏋️`, // Subject line
            template: 'example',
            context: {
                username: 'Example',
                password: 'myPass'
            }
        }, function(err, info) {
            if(err){
                res.status(500).send(`Error: ${err}`);
                return;
            }
            res.json({
                success: true,
                message: `Messages sent to admins`
            })
        });
    })

    // Add meal to DB
    api.post('/add-meal', function (req, res) {

        let meal = new Meal({
            name: req.body.name,
            description: req.body.description,
            selected: req.body.selected,
            imageUrl: req.body.imageUrl,
            portions: req.body.portions,
            date:     req.body.date,
            _creator: req.decoded.id // assign the _id from the user (user._id === req.decoded.id)

        });

        meal.save((err) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed to save meal to DB"
                });
            }
            res.json({
                meal: meal,
                success: true,
                message: `Meal "${meal.name}" was created!`,
            });
            res.send();
        });

    });

    // Get all meals
    api.get('/meals', function (req, res) {
        Meal.find({}, function (err, meals) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(meals);
        });
    });

    // Find meals by Name (regex pattern)
    api.get('/search-meals/', function (req, res) {
        const rgxp = new RegExp(req.query.name, "i");
        Meal.find({name: rgxp }, function (err, meals) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(meals);
        });
    });

    // Get meal by ID with user data (connection between collections 'users' and 'meals' in DB)
    api.get('/meal/:id', function (req, res) {
        Meal.findById(req.params.id)
            .populate('_creator')
            .exec(function (err, meal) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.json({
                    meal: meal,
                    success: true,
                    message: `Meal "${meal.name}" was get!`,
                });
            })
    });

    // Get meals by array of meals id's
    api.get('/meals-by-ids/:ids', function (req, res) {
        const mealsArray = req.params.ids.split(',');
        mealsArray.map((meal) => {
            mongoose.Types.ObjectId(meal);
        });

        Meal.find({ _id: { $in: mealsArray}}, 
            function (err, meals) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.json({
                    meals: meals,
                    success: true,
                    message: `Meals found`,
                });
            });
    });

    // Delete meal by ID
    api.delete('/meal/:id', function (req, res) {
        Meal.findByIdAndRemove(req.params.id, function (err, meal) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json({
                message: "Meal successfully deleted",
                id: meal._id
            });
        });
    });

    // Update meal by ID
    api.put('/meal/:id', function (req, res) {
        Meal.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            selected: req.body.selected,
            imageUrl: req.body.imageUrl,
            portions: req.body.portions,
            date:     req.body.date,
        }, function (err, meal) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json({
                meal: meal,
                sucess: true,
                id: meal._id
            });
        });
    });

    // Add place to DB
    api.post('/add-place', function (req, res) {

        let place = new Place({
            name:               req.body.name,
            googleId:           req.body.googleId,
            email:              req.body.email,
            phone:              req.body.phone,
            fullAddress:        req.body.fullAddress,
            website:            req.body.website,
            currency:           req.body.currency,
            elpOpeningHours:    req.body.elpOpeningHours,
            location:           req.body.location,
            mealIds:            req.body.mealIds,
            deliveryAvailable:  req.body.deliveryAvailable,
            takeAwayAvailable:  req.body.takeAwayAvailable,
            paymentOptions:     req.body.paymentOptions,
            rating:             req.body.rating,
            date:               req.body.date,
            _creator:           req.decoded.id // assign the _id from the user (user._id === req.decoded.id)

        });

        place.save((err) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed to save place to DB"
                });
            }
            res.json({
                place: place,
                success: true,
                message: `Place "${place.name}" was created!`,
            });
            res.send();
        });
    });

    // Get all places
    api.get('/places', function (req, res) {
        Place.find({}, function (err, places) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(places);
        });
    });

    // Find places by Name (regex pattern)
    api.get('/search-places/', function (req, res) {
        const rgxp = new RegExp(req.query.name, "i");
        Place.find({name: rgxp }, function (err, places) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(places);
        });
    });

    // Get place by ID with user data (connection between collections 'users' and 'places' in DB)
    api.get('/place/:id', function (req, res) {
        Place.findById(req.params.id)
            .populate('_creator')
            .exec(function (err, place) {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.json({
                    place: place,
                    success: true,
                    message: `Place "${place.name}" was get!`,
                });
            })
    });

    // Delete place by ID
    api.delete('/place/:id', function (req, res) {
        Place.findByIdAndRemove(req.params.id, function (err, place) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json({
                message: "Place successfully deleted",
                id: place._id
            });
        });
    });

    // Update place by ID
    api.put('/place/:id', function (req, res) {
        Place.findByIdAndUpdate(req.params.id, {
            name:               req.body.name,
            googleId:           req.body.googleId,
            email:              req.body.email,
            phone:              req.body.phone,
            fullAddress:        req.body.fullAddress,
            website:            req.body.website,
            currency:           req.body.currency,
            elpOpeningHours:    req.body.elpOpeningHours,
            location:           req.body.location,
            mealIds:            [req.body.mealIds],
            deliveryAvailable:  req.body.deliveryAvailable,
            takeAwayAvailable:  req.body.takeAwayAvailable,
            paymentOptions:     req.body.paymentOptions,
            rating:             req.body.rating,
            date:               req.body.date
        }, function (err, place) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json({
                place: place,
                sucess: true,
                id: place._id
            });
        });
    });

    // Get places by User ID
    api.get('/user-places', function (req, res) {
        Place.find({_creator: req.decoded.id }, function (err, places) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(places);
        });
    });

    api.get('/me', function (req, res) {
        res.json(req.decoded);
    });

    return api;
}
