require("dotenv").config();

const usernames = ["Luigino", "Fabiello", "Marione"];
const names = ["Gabriele", "Luigi"];
const surnames = ["D'Annunzio", "Pirandello"];

const to_del_operators = [];

function randomInt(min, max) { // Estremi inclusi
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getUsername()  { return `${usernames[randomInt(0, usernames.length - 1)]}_${randomInt(0, 100000)}`; }
function getName()      { return `${names[randomInt(0, names.length - 1)]}`; }
function getSurname()   { return `${surnames[randomInt(0, surnames.length - 1)]}`; }


module.exports.loginAsAdmin = async function (session) {
    const res = await session.post('/auth/login_operator').send({ username: "admin", password: "admin" });
    return res.body.access_token.value;
}

module.exports.loginAsOperatorWithPermission = async function (session, permission) {
    const admin_token = await module.exports.loginAsAdmin(session);
    const username = getUsername();

    await session.post('/user/operators/').send({
        username: username, password: "PasswordMoltoComplessa1!",
        email: `${username}@animalhouse.com`,
        name: getName(), surname: getSurname(),
        permission: permission,
        role: "Test",
        working_time: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    }).set({ Authorization: `Bearer ${admin_token}`});
    to_del_operators.push(username);

    const res_login = await session.post('/auth/login_operator').send({ username: username, password: "PasswordMoltoComplessa1!" });

    return {
        username: username,
        token: res_login.body.access_token.value
    };
}

module.exports.cleanup = async function (session) {
    const admin_token = await module.exports.loginAsAdmin(session);

    for (operator of to_del_operators) {
        await session.delete(`/user/operators/${operator}`).set({ Authorization: `Bearer ${admin_token}` });
    }
}