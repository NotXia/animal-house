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

function createTokens(username) {
    const jwt_payload = { username: username };
    const access_token  = jwt.sign(jwt_payload, process.env.ACCESS_TOKEN_KEY, { algorithm: process.env.JWT_ALGORITHM, expiresIn: process.env.ACCESS_TOKEN_EXP });
    const refresh_token = jwt.sign(jwt_payload, process.env.REFRESH_TOKEN_KEY, { algorithm: process.env.JWT_ALGORITHM, expiresIn: process.env.REFRESH_TOKEN_EXP });

    return {
        access: access_token,
        refresh: refresh_token
    };
}

router.post("/login", function (req, res) {
    const INVALID_LOGIN = { message: "Invalid credentials" };

    passport.authenticate("local", { session: false }, function (err, user) {
        if (err || !user) { return res.status(400).json(INVALID_LOGIN); }
        
        req.login(user, { session: false }, async function (err) {
            if (err) { console.log(err); return res.status(400).json(INVALID_LOGIN); }

            const tokens = createTokens(user.username);
            
            // Salvataggio del refresh token
            let dbo = db.dbo;
            await dbo.collection("tokens").insertOne({ username: user.username, token: tokens.refresh, timestamp: new Date() }).catch((err) => {
                return res.sendStatus(500);
            });

            res.status(200).json({
                auth: true,
                access_token: tokens.access,
                refresh_token: tokens.refresh
            });
        });
    })(req, res);
});

router.post("/refresh", function (req, res) {
    const INVALID_LOGIN = { message: "Invalid token" };
    const old_refresh_token = req.body.refresh_token;

    jwt.verify(old_refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.status(400).json(INVALID_LOGIN); }
        
        let dbo = db.dbo;
        let new_access_token = null;
        let new_refresh_token = null;

        try {
            // Verifica validità del token
            const token_entry = await dbo.collection("tokens").findOne({token: old_refresh_token});
            if (!token_entry) { return res.status(400).json(INVALID_LOGIN); }
    
            // Rinnovo token
            const tokens = createTokens(token.username);
            new_access_token  = tokens.access;
            new_refresh_token = tokens.refresh;
           
            await dbo.collection("tokens").deleteOne({ token: old_refresh_token });
            await dbo.collection("tokens").insertOne({ username: token.username, token: new_refresh_token, timestamp: new Date() });
        }
        catch (err) {
            return res.sendStatus(500);
        }

        return res.status(200).json({
            access_token: new_access_token,
            refresh_token: new_refresh_token
        })
    });

});

router.post("/logout", function(req, res) {
    const INVALID_LOGIN = { message: "Invalid token" };
    const refresh_token = req.body.refresh_token;

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.status(400).json(INVALID_LOGIN); }

        // Cancella il token salvato
        let dbo = db.dbo;
        await dbo.collection("tokens").deleteOne({ token: refresh_token }).catch((err) => { return res.sendStatus(500); });
        
        res.redirect(200, "/");
    });
});

module.exports = router;