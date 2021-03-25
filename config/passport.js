const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { Strategy } = require('passport-local');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
require('dotenv').config();


/*done(err,__) err as a first parameter*/
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err,user){
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GCLIENTID,
    clientSecret:process.env.GCLIENTSECRET,
    callbackURL:"http://localhost:3000/logIn/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    (accessToken,refreshToken,profile,done)=>{
        User.findOne({email: profile.emails[0].value},function(err,user){
            if(err) return done(err);
            if(user)
            {
                console.log("user found");
                console.log(user);
                if(user.guid == profile.id){
                    return done(null,user);
                }
                user.guid = profile.id;
                user.updated = Date.now();  
                user.save(function(err){
                    if(err)
                    {
                        throw err;
                    }
                    return done(null,user);
                });                
                // return done(null,user);
            }
            else
            {
                var newUser = new User();
                newUser.guid = profile.id;
                newUser.fullname = profile.name.givenName + ' ' + profile.name.familyName;
                newUser.email = profile.emails[0].value;
                newUser.profile_image = profile.photos[0].value;
                newUser.save(function(err){
                    if(err)
                    {
                        throw err;
                    }
                    return done(null,newUser);
                });
            }
        })
    }));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req,email, password, done){
    console.log('hy');
    User.findOne({'email': email}, async function(err, user){
        if(err){
            return done(err);
        }
        if(req.body.fullname=="" || req.body.username==""){
            return done(null, false, {message: 'Missing credentials'});
        }

        if(user){
            return done(null, false, {message: 'Email is already in use'});
        }
        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = email;
        newUser.password = bcrypt.hashSync(password, 10);
        newUser.save(function(err, result){
            if(err){
                console.log(err);
                return done(err);
            }

            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    User.findOne({'email': email},function(err, user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'No user found.'});
        }
        // if(!user.validPassword(password)){
        //     return done(null, false, {message: 'Incorrect password.'});
        // }
        if(!bcrypt.compareSync(password, user.password)){
            return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, user);
    });
}))