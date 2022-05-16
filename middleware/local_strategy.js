const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const OperatorModel = require("../models/auth/operator");

/* Strategia Passport per autenticazione username + password */
passport.use("local_operator", new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password"
    },
    async function (in_username, in_password, done) {
        // Autenticazione dell'utente
        const user_data = await OperatorModel.findOne({ username: in_username }).exec().catch((err) => {return done(err);});
        if (!user_data) { return done(null, false); } // Non esiste l'utente

        bcrypt.compare(in_password, user_data.password).then((hash_match) => {
            if (hash_match) { 
                return done(null, { id: user_data._id, username: user_data.username, is_operator: true }); 
            }
            else { 
                return done(null, false); 
            }
        });
    }
));