const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require("./../db");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const ms = require("ms");


// Strategia Passport per autenticazione username + password
passport.use("local", new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password"
    },
    function (in_username, in_password, done) {
        let dbo = db.dbo;

        // Autenticazione dell'utente
        dbo.users.findOne({ username: in_username }, function (err, user_data) {
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
        access: {
            value: access_token,
            expiration: (new Date()).getTime() + ms(process.env.ACCESS_TOKEN_EXP)
        },
        refresh: { 
            value: refresh_token,
            expiration: (new Date()).getTime() + ms(process.env.REFRESH_TOKEN_EXP)
        }
    };
}

async function storeToken(username, token, expiration_time) {
    let dbo = db.dbo;
    const refresh_token_hash = await bcrypt.hash(token, 10);

    let insert_result = await dbo.tokens.insertOne({
        username: username,
        token_hash: refresh_token_hash,
        expiration: expiration_time
    }).catch((err) => { throw err; });

    return insert_result.insertedId;
}


router.post("/login", function (req, res) {
    const INVALID_LOGIN = { message: "Invalid credentials" };

    passport.authenticate("local", { session: false }, function (err, user) {
        if (err || !user) { return res.status(400).json(INVALID_LOGIN); }
        
        req.login(user, { session: false }, async function (err) {
            if (err) { console.log(err); return res.status(400).json(INVALID_LOGIN); }

            const tokens = createTokens(user.username);
            
            // Salvataggio del refresh token, tenendo traccia dell'id per semplificare la ricerca del token nelle operazioni future
            tokens.refresh.id = await storeToken(user.username, tokens.refresh.value, tokens.refresh.expiration)
                                      .catch((err) => {return res.sendStatus(500)});
            
            res.status(200).json({
                access_token: tokens.access,
                refresh_token: tokens.refresh
            });
        });
    })(req, res);
});

router.post("/refresh", function (req, res) {
    const INVALID_LOGIN = { message: "Invalid token" };
    const old_refresh_token = req.body.refresh_token;
    const old_refresh_token_id = req.body.id;

    jwt.verify(old_refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.status(400).json(INVALID_LOGIN); }
        
        let dbo = db.dbo;
        let tokens = null;

        try {
            // Verifica validità del token
            const token_entry = await dbo.tokens.findOne({ _id: old_refresh_token_id });
            if (!token_entry) { return res.status(400).json(INVALID_LOGIN); }

            if (!await bcrypt.compare(old_refresh_token, token_entry.token_hash)) {
                return res.status(400).json(INVALID_LOGIN);
            }
    
            // Rinnovo token
            await dbo.tokens.deleteOne({ _id: old_refresh_token_id });

            tokens = createTokens(token.username);
            tokens.refresh.id = await storeToken(token.username, tokens.refresh.value, tokens.refresh.expiration)
                                      .catch((err) => { return res.sendStatus(500) });
        }
        catch (err) {
            return res.sendStatus(500);
        }

        return res.status(200).json({
            access_token: tokens.access,
            refresh_token: tokens.refresh
        })
    });

});

router.post("/logout", function(req, res) {
    const INVALID_LOGIN = { message: "Invalid token" };
    const refresh_token = req.body.refresh_token;
    const refresh_token_id = req.body.id;

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.status(400).json(INVALID_LOGIN); }

        // Cancella il token salvato
        let dbo = db.dbo;
        await dbo.tokens.deleteOne({ _id: refresh_token_id }).catch((err) => { return res.sendStatus(500); });

        res.status(200);
    });
});

module.exports = router;