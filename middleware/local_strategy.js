const db = require("../db");
const passport = require("passport");
const LocalStrategy = require("passport-local");
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
                if (hash_match) { return done(null, { username: user_data.username }); }
                else { return done(null, false); }
            });
        });
    }
));