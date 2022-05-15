require('dotenv').config();
const expressJwt = require("express-jwt");
const OperatorModel = require("../models/auth/operator");
const UserModel = require("../models/auth/user");

/**
 * Middleware per autenticare e autorizzare un utente
 * @param {[String[]]} required_permissions Vettore contenente "gruppi di permessi"
 * @example auth_middleware([ ["admin"] ]) -> ammette solo utenti con permesso admin
 *          auth_middleware([ ["admin"], ["write_shop", "read_shop"] ]) -> ammette utenti con permessi (admin OR (write_shop AND read_shop))
 *          auth_middleware() -> ammette utenti autenticati, non richiede permessi particolari
 */
function auth_middleware(required_permissions=[]) {
    return [ 
        /* Verifica la presenza e validità dell'access token */
        expressJwt.expressjwt({
            secret: process.env.ACCESS_TOKEN_KEY,
            algorithms: [process.env.JWT_ALGORITHM]
        }),
        function (err, req, res, next) {
            if (err.name === "UnauthorizedError") { return res.sendStatus(401) }
            return next();
        },

        /* Verifica i permessi */
        async function (req, res, next) {
            if (required_permissions.length === 0) { return next(); } // Caso in cui non sono richiesti permessi particolari

            // Estrazione permessi
            const AuthModel = req.auth.is_operator ? OperatorModel : UserModel;
            const user = await AuthModel.findById(req.auth.id, ["permission"]);

            // Verifica se uno dei gruppi di permessi è soddisfatto
            for (let i=0; i<required_permissions.length; i++) {
                // Dato un gruppo, si rimuovono i permessi che l'utente possiede, se il vettore ottenuto è vuoto, si hanno i permessi sufficienti
                const permissions_array = required_permissions[i].filter((permission) => { return !user.permission[permission]; })
                if (permissions_array.length === 0) { return next(); }
            }
            
            return res.sendStatus(403);
        }
    ];
} 
    

module.exports = auth_middleware