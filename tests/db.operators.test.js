require("dotenv").config();
const UserModel = require("../models/auth/user");
const OperatorModel = require("../models/auth/operator");

describe("Database - gestione dipendenti", function () {
    let operators_id = [];
    let users_id = [];
    let operator;
    let user;

    test("Popolazione database", async function () {
        operator = await new OperatorModel({ working_time: {} }).save();
        operators_id.push(operator._id);
        user = await new UserModel({ username: "user1", password: "a", email: "user1@test.it", name: "User1", surname: "Uno", type_id: operator._id, type_name: "operator" }).save();
        users_id.push(user._id);
    });

    test("Verifica presenza permessi", async function () {
        expect(user.permission).toBeDefined();
        expect(user.permission.admin).toBe(false);
    });

    test("Pulizia database", async function () {
        for (const id of operators_id) { await OperatorModel.findByIdAndDelete(id); }
        for (const id of users_id) { await UserModel.findByIdAndDelete(id); }
    });
});

