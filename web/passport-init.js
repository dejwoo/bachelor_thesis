var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
//temporary data store
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Journal = mongoose.model('Journal');

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        //tell passport which object to user use.
        console.log('serializing user:',user._id);
        return done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        //return user object back
        User.findById(id, (err,user) => {
            if (err) {
                return (err, false);
            }
            if (!user) {
                return done("User not found", false);
            }
            return done(err,user);
        });
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {

            User.findOne({'username':username}, (err,user) => {
                if (err) {
                    return done(err,false);
                }
                if (!user) {
                    return done("Wrong username", false);
                }
                if (!isValidPassword(user, password)) {
                    return done("Wrond passowrd", false);
                }
                return done(null, user);
            });
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            //check if users exits
            User.findOne({'username': username}, (err, user) => {
                if (err){
                    return done(err,false);
                }
                if (user) {
                    //we have already signed user
                    console.log("Username already taken " + user.username);
                    return done("Username already taken " + user.username,false);
                }
                var user = new User();
                user.username = username;
                user.password = createHash(password);
                console.log('Succesfully signed up user: ' + user);
                user.save((err,user) => {
                    if (err) {
                        return done(err, false);
                    }
                    console.log('Succesfully signed up user: ' + user);
                    return done(null,user);
                });
            });
        })
    );

    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};