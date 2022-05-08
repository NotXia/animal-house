require('dotenv').config();
const expressJwt = require("express-jwt").expressjwt;

module.exports = expressJwt({
    secret: process.env.ACCESS_TOKEN_KEY,
    algorithms: [process.env.JWT_ALGORITHM]
});