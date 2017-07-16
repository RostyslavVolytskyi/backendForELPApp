## Usage -- Eat Like Pro Server --
nodemon, mongoDB, mongoDB Compass and npm has to be installed on your machine!
Install gulp globally or call gulp tasks from npm folder.
For example:
```
node_modules/gulp/bin/gulp.js start-mongo
```

#### 1: Install mongoDB
mongoDB installation for windows
(don't forget to add mongoDB Environment Variable to PATH)
- https://www.mkyong.com/mongodb/how-to-install-mongodb-on-windows/

mongoDB installation for Mac :
- https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

#### 2: Install packages
```
npm install
```

#### 3: Install nodemon

```
npm install nodemon -g
```

-- or if you dont want it globally than run it from here:

```
node_modules/nodemon/bin/nodemon.js
```

#### 4: Start MongoDB and Server

```
gulp
```

##### Optional
* install mongoDB Compass to observe and edit your local mongoDB (default port 27017)

### Deployed on Heroku
Visit https://eatlikepro-node.herokuapp.com
Front end part https://eatlikeproweb.herokuapp.com/
