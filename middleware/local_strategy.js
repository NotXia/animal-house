const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const UserModel = require("../models/user");

/* Strategia Passport per autenticazione username + password */
passport.use("local", new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password"
    },
    async function (in_username, in_password, done) {
        // Autenticazione dell'utente
        const user_data = await UserModel.findOne({ username: in_username }).exec().catch((err) => {return done(err);});
        if (!user_data) { return done(null, false); } // Non esiste l'utente

        bcrypt.compare(in_password, user_data.password).then((hash_match) => {
            if (hash_match) { 
                return done(null, { username: user_data.username }); 
            }
            else { 
                return done(null, false); 
            }
        });
    }
));