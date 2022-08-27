require('dotenv').config();

module.exports.sendVerificationEmail = async function (username) {
    if (process.env.TESTING) { return; }
    /* TODO */
}