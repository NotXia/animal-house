const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const UserModel = require("../models/auth/user");

const error = require("../error_handler");

/* Strategia Passport per autenticazione username + password */
passport.use("local", new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password"
    },
    async function (in_username, in_password, done) {
        // Autenticazione dell'utente
        let user_data;

        try {
            user_data = await UserModel.findOne({ username: in_username }).exec();
            if (!user_data) { return done(error.generate.UNAUTHORIZED("Credenziali non valide")); } 
            if (!user_data.enabled) { return done(error.generate.FORBIDDEN("Utente non attivo")); } 
        }
        catch (err) {
            return done(err);
        }

        bcrypt.compare(in_password, user_data.password).then((hash_match) => {
            if (hash_match) { 
                return done(null, { id: user_data._id, username: user_data.username, is_operator: user_data.isOperator() }); 
            }
            else { 
                return done(error.generate.UNAUTHORIZED("Credenziali non valide"));
            }
        });
    }
));