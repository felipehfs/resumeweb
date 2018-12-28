const model = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport")
const {secret} = require('../../config/secrets')

exports.register = async (req, res) => {
    const newUser = req.body;
    newUser.password = bcrypt.hashSync(req.body.password, 10);
    model.User.build(newUser).save()
    .then(data => {
        data.password = undefined;
        res.status(201).json(data);
    }).catch(err => {
        res.status(500).send(err);
    })
}

exports.login = function (req, res, next) {
    passport.authenticate("local", {session: false}, function (err, user, info) {
        if (err || !user) {
            return res.status(400).json({
                message: "Bad request",
                err,
                user
            })
        }
       req.login(user, { session: false}, (err) => {
           if (err) {
               res.status(500).send(err)
           }

           const now = Math.floor(Date.now() / 1000)
           const payload = {
               id: user.id,
               email: user.email,
               name: user.name,
               iat: now,
               exp: now + (60 * 60 * 24 * 7)
           }
           
           const token = jwt.sign(payload, secret)
           user.password = undefined
           return res.json({ user, token })
       })
    })(req, res)
}