const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require("./../db");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");


// Strategia Passport per autenticazione username + password
passport.use("local", new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password"
    },
    function (in_username, in_password, done) {
        let dbo = db.dbo;

        // Autenticazione dell'utente
        dbo.collection("users").findOne({ username: in_username }, function (err, user_data) {
            if (err) { return done(err); }
            if (!user_data) { return done(null, false); }

            bcrypt.compare(in_password, user_data.password).then((hash_match) => {
                if (hash_match) { return done(null, user_data); }
                else { return done(null, false); }
            });
        });
    }
));

router.post("/login", function (req, res) {
    const INVALID_LOGIN = { auth: false };

    passport.authenticate("local", { session: false }, function (err, user) {
        if (err || !user) { return res.status(400).json(INVALID_LOGIN); }
        
        req.login(user, { session: false }, async function (err) {
            if (err) { console.log(err); return res.status(400).json(INVALID_LOGIN); }

            // Generazione token JWT
            const jwt_payload = { username: user.username };
            const access_token  = jwt.sign(jwt_payload, process.env.ACCESS_TOKEN_KEY, { algorithm: process.env.JWT_ALGORITHM, expiresIn: process.env.ACCESS_TOKEN_EXP });
            const refresh_token = jwt.sign(jwt_payload, process.env.REFRESH_TOKEN_KEY, { algorithm: process.env.JWT_ALGORITHM, expiresIn: process.env.REFRESH_TOKEN_EXP });
            
            // Salvataggio del refresh token
            let dbo = db.dbo;
            await dbo.collection("tokens").insertOne({ username: user.username, token: refresh_token, timestamp: new Date() }).catch((err) => {
                return res.status(400).json(INVALID_LOGIN);
            });

            res.status(200).json({
                auth: true,
                access_token: access_token,
                refresh_token: refresh_token,
            });
        });
    })(req, res);
});

module.exports = router;