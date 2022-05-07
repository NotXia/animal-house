const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require("./../db");
const ObjectId = require("mongodb").ObjectId;
const ms = require("ms");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");


/* Strategia Passport per autenticazione username + password */
passport.use("local", new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password"
    },
    function (in_username, in_password, done) {
        // Autenticazione dell'utente
        db.users.findOne({ username: in_username }, function (err, user_data) {
            if (err) { return done(err); }
            if (!user_data) { return done(null, false); } // Non esiste l'utente

            bcrypt.compare(in_password, user_data.password).then((hash_match) => {
                if (hash_match) { return done(null, {username: user_data.username}); }
                else { return done(null, false); }
            });
        });
    }
));

/**
 * Crea i token (access + refresh) associati ad un utente.
 * @param username
 * @returns I token creati nel formato { tipo { valore, scadenza } }
 */
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

/**
 * Memorizza il refresh token.
 * @param {string} username         Utente associato al token
 * @param {string} token            Valore del token
 * @param {number} expiration_time  Timestamp di scadenza del token
 * @returns id associato al token inserito
 */
async function storeToken(username, token, expiration_time) {
    const refresh_token_hash = await bcrypt.hash(token, 10);

    let insert_result = await db.tokens.insertOne({
        username: username,
        token_hash: refresh_token_hash,
        expiration: expiration_time
    }).catch((err) => { throw err; });

    return insert_result.insertedId;
}

/**
 * Imposta il refresh token nei cookie del client.
 * @param res Oggetto res dell'endpoint
 * @param {string} token        Valore del token
 * @param {string} token_id     Id del token
 * @param {number} expiration   Timestamp di scadenza del token
 */
function setRefreshTokenCookie(res, token, token_id, expiration) {
    const cookie_option = {
        expires: new Date(expiration),
        httpOnly: true,
        path: "/auth",
        secure: true
    };

    res.cookie("refresh_token", token, cookie_option);
    res.cookie("refresh_token_id", token_id, cookie_option);
}

/* Gestisce l'autenticazione di un utente e l'emissione dei token */
router.post("/login", function (req, res) {
    const INVALID_LOGIN = { message: "Invalid credentials" };

    passport.authenticate("local", { session: false }, function (err, user) {
        if (err || !user) { return res.status(401).json(INVALID_LOGIN); }
        
        req.login(user, { session: false }, async function (err) {
            if (err) { console.log(err); return res.status(401).json(INVALID_LOGIN); }

            const tokens = createTokens(user.username);
            
            // Salvataggio del refresh token, tenendo traccia dell'id per semplificare la ricerca del token nelle operazioni future
            tokens.refresh.id = await storeToken(user.username, tokens.refresh.value, tokens.refresh.expiration)
                                      .catch((err) => {return res.sendStatus(500)});
            
            setRefreshTokenCookie(res, tokens.refresh.value, tokens.refresh.id, tokens.refresh.expiration);
            res.status(200).json({
                access_token: tokens.access,
                refresh_token: tokens.refresh
            });
        });
    })(req, res);
});

/* Gestisce il rinnovo dei token */
router.post("/refresh", function (req, res) {
    const INVALID_LOGIN = { message: "Invalid token" };
    const old_refresh_token = req.cookies.refresh_token;
    const old_refresh_token_id = req.cookies.refresh_token_id;

    jwt.verify(old_refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.status(401).json(INVALID_LOGIN); }
        
        let tokens = null;

        try {
            // Verifica validità del token dal database
            const token_entry = await db.tokens.findOne({ _id: ObjectId(old_refresh_token_id) });
            if (!token_entry) { return res.status(401).json(INVALID_LOGIN); }

            if (!await bcrypt.compare(old_refresh_token, token_entry.token_hash)) {
                return res.status(401).json(INVALID_LOGIN);
            }
    
            // Rinnovo e salvataggio token
            await db.tokens.deleteOne({ _id: ObjectId(old_refresh_token_id) });
            tokens = createTokens(token.username);
            tokens.refresh.id = await storeToken(token.username, tokens.refresh.value, tokens.refresh.id, tokens.refresh.expiration);
        }
        catch (err) {
            return res.sendStatus(500);
        }

        setRefreshTokenCookie(res, tokens.refresh.value, tokens.refresh.id, tokens.refresh.expiration);
        return res.status(200).json({
            access_token: tokens.access,
            refresh_token: tokens.refresh
        })
    });

});

/* Gestisce il logout di un utente */
router.post("/logout", function(req, res) {
    const refresh_token = req.cookies.refresh_token;
    const refresh_token_id = req.cookies.refresh_token_id;

    setRefreshTokenCookie(res, 0, 0, 0); // Per invalidare il cookie
    
    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.sendStatus(401); }

        // Cancella il token salvato
        await db.tokens.deleteOne({ _id: ObjectId(refresh_token_id) }).catch((err) => { return res.sendStatus(500); });

        return res.sendStatus(200);
    });
});

module.exports = router;