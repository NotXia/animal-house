require('dotenv').config();
const expressJwt = require("express-jwt");
const UserModel = require("../models/auth/user");

function isSubset(subset, superset) {
    return subset.every((val) => { return superset.includes(val); });
}

/**
 * Middleware per autenticare e autorizzare un utente
 * @param {[String[]]} required_permissions Vettore contenente "gruppi di permessi"
 * @param {[String[]]} superuser_permissions Vettore contenente "gruppi di permessi superuser". I superuser bypassano i controlli di ownership
 * @example auth_middleware([], [ ["admin"] ]) -> ammette solo utenti con permesso admin. admin è superuser
 *          auth_middleware([ ["write_shop", "read_shop"] ], [ ["admin"] ]) -> ammette utenti con permessi (admin OR (write_shop AND read_shop)). admin è superuser
 *          auth_middleware() -> ammette utenti autenticati, non richiede permessi particolari
 */
function auth_middleware(required_permissions=[], superuser_permissions=[]) {
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
            if (required_permissions.length === 0 && superuser_permissions.length === 0) { return next(); } // Caso in cui non sono richiesti permessi particolari

            // Estrazione permessi
            const user = await UserModel.findById(req.auth.id, { permission: 1 });
            const user_permissions = Object.keys(user.permission.toObject()).filter((key) => { return user.permission[key]; });

            // Verifica se uno dei gruppi di permessi da superuser è soddisfatto
            for (const permissions of superuser_permissions) {
                if (isSubset(permissions, user_permissions)) {
                    req.auth.superuser = true;
                    return next(); 
                }
            }

            // Verifica se uno dei gruppi di permessi è soddisfatto
            for (const permissions of required_permissions) {
                if (isSubset(permissions, user_permissions)) { 
                    req.auth.superuser = false;
                    return next(); 
                }
            }
            
            return res.sendStatus(403);
        }
    ];
} 
    

module.exports = auth_middleware