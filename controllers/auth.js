require('dotenv').config();
const ms = require("ms");

const TokenModel = require("../models/auth/token");

const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const utils = require("../utilities");
const error = require("../error_handler");

/**
 * Crea i token (access + refresh) associati ad un utente.
 * @param user_id   Id dell'utente
 * @returns I token creati nel formato { tipo { valore, scadenza } }
 */
function createTokens(user_id, username, is_operator) {
    const jwt_payload = { id: user_id, username: username, is_operator: is_operator };
    const access_token = jwt.sign(jwt_payload, process.env.ACCESS_TOKEN_KEY, { algorithm: process.env.JWT_ALGORITHM, expiresIn: process.env.ACCESS_TOKEN_EXP });
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
 * @param {string} user_id          Id dell'utente associato al token
 * @param {string} token            Valore del token
 * @param {number} expiration_time  Timestamp di scadenza del token
 * @returns id associato al token inserito
 */
async function storeRefreshToken(user_id, token, expiration_time) {
    const refresh_token_hash = await bcrypt.hash(token, parseInt(process.env.SALT_ROUNDS));

    const token_entry = await new TokenModel({
        user_id: user_id,
        token_hash: refresh_token_hash,
        expiration: expiration_time
    }).save();

    return token_entry._id;
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
        secure: process.env.TESTING ? false : true // Altrimenti l'ambiente di test non riesce a utilizzarli
    };

    res.cookie("refresh_token", token, cookie_option);
    res.cookie("refresh_token_id", token_id, cookie_option);
}


/**
 * Gestisce l'autenticazione di un utente e l'emissione dei token 
 */
async function loginController(req, res) {
    const user = req.user; // I dati dell'utente elaborati da Passport
    const tokens = createTokens(user.id, user.username, user.is_operator);

    // Salvataggio del refresh token, tenendo traccia dell'id per semplificare la ricerca del token nelle operazioni future
    try {
        tokens.refresh.id = await storeRefreshToken(user.id, tokens.refresh.value, tokens.refresh.expiration);
    }
    catch (err) {
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }

    setRefreshTokenCookie(res, tokens.refresh.value, tokens.refresh.id, tokens.refresh.expiration);
    return res.status(utils.http.OK).json({ access_token: tokens.access });
}

/**
 * Gestisce il rinnovo dei token
 */
function refreshController(req, res) {
    const old_refresh_token = req.cookies.refresh_token;
    const old_refresh_token_id = req.cookies.refresh_token_id;

    if (!old_refresh_token || !old_refresh_token_id) { return res.status(utils.http.UNAUTHORIZED).json(error.formatMessage(utils.http.UNAUTHORIZED)); }

    jwt.verify(old_refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.status(utils.http.UNAUTHORIZED).json(error.formatMessage(utils.http.UNAUTHORIZED)); }

        let tokens = null;

        try {
            // Verifica validità del token dal database
            const token_entry = await TokenModel.findById(old_refresh_token_id).exec();
            if (!token_entry) { return res.status(utils.http.UNAUTHORIZED).json(error.formatMessage(utils.http.UNAUTHORIZED)); }

            if (!await bcrypt.compare(old_refresh_token, token_entry.token_hash)) {
                return res.status(utils.http.UNAUTHORIZED).json(error.formatMessage(utils.http.UNAUTHORIZED));
            }

            // Rinnovo e salvataggio token
            await TokenModel.findByIdAndDelete(old_refresh_token_id);
            tokens = createTokens(token.id, token.username, token.is_operator);
            tokens.refresh.id = await storeRefreshToken(token.id, tokens.refresh.value, tokens.refresh.expiration);
        }
        catch (err) {
            return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
        }

        setRefreshTokenCookie(res, tokens.refresh.value, tokens.refresh.id, tokens.refresh.expiration);
        return res.status(utils.http.OK).json({ access_token: tokens.access });
    });
}

/**
 * Gestisce il logout di un utente
 */
function logoutController(req, res) {
    const refresh_token = req.cookies.refresh_token;
    const refresh_token_id = req.cookies.refresh_token_id;
    
    setRefreshTokenCookie(res, 0, 0, 0); // Per invalidare il cookie
    if (!refresh_token || !refresh_token_id) { return res.status(utils.http.UNAUTHORIZED).json(error.formatMessage(utils.http.UNAUTHORIZED)); }

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY, async function (err, token) {
        if (err) { return res.status(utils.http.UNAUTHORIZED).json(error.formatMessage(utils.http.UNAUTHORIZED)); }

        // Cancella il token salvato
        try {
            await TokenModel.findByIdAndDelete(refresh_token_id);
        }
        catch (err) { 
            return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR); 
        }

        return res.sendStatus(utils.http.NO_CONTENT);
    });
}

module.exports = { 
    login: loginController,
    refresh: refreshController,
    logout: logoutController
}