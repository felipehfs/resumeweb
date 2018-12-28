const LinkedinStategy = require("passport-linkedin").Strategy;
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const { linkedin, secret } = require("../config/secrets");
const model = require("../models")
const bcrypt = require('bcrypt')
const passportJWT = require('passport-jwt')
const ExtractJWT = passportJWT.ExtractJwt
const JWTStrategy = passportJWT.Strategy

module.exports = function(app) {

    app.use(passport.initialize())

    passport.use(new LinkedinStategy(linkedin, function (token, tokenSecret, profile, done) {
        model.User.findOrCreate({
            where: {
                name: profile.displayName,
                email: profile.email,
            }
        })
            .spread((data, created) => {
                const user = data[0]
                const now = Math.floor(Date.now() / 1000);
                user.iat = now
                user.exp = now + (60 * 60 * 24 * 7)
                done(null, user)
            })
    }))


    passport.serializeUser(function (user, done) {
        done(null, user);
    })
    
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    })

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function(email, password, callback){
        
        return model.User.findOne({ where: { email } }).then(user => {
            if (!user) {
                return callback(null, false, { message: "Email ou senha incorreta!"})
            }else {
                const isSame = bcrypt.compareSync(password, user.password)
                if (!isSame) {
                    return callback(null, false, {message: "Email ou senha incorreta!"})
                }
                return callback(null, user, { message: 'Logged successfully!'})
            }
        }).catch(err => callback(err))
    }))


    passport.use(new JWTStrategy({ 
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret
    }, function(jwtpayload, cb){
        return model.User.findById(jwtpayload.id)
            .then(user => {
                return cb(null, err) 
            })
            .catch(err =>{
                return cb(err)
            })
    }))
}