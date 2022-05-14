require("dotenv").config();
const OperatorModel = require("../../models/auth/operator");
const RoleModel = require("../../models/services/role");

function randomOf(array) {
    return array[Math.floor(Math.random() * array.length)]
}

describe("Database - gestione dipendenti", function () {
    let roles_id = [];
    let operators_id = [];
    let tmp = undefined;
    let operator;

    test("Popolazione database", async function () {
        tmp = await new RoleModel({ name: "Veterinario" }).save();
        roles_id.push(tmp._id);
        tmp = await new RoleModel({ name: "Psicologo" }).save();
        roles_id.push(tmp._id);

        operator = await new OperatorModel({ username: "user1", password: "a", email: "user1@test.it", name: "User1", surname: "Uno", role_id: randomOf(roles_id), working_time: {} }).save();
        operators_id.push(operator._id);
    });

    test("Verifica presenza permessi", async function () {
        expect(operator.permission).toBeDefined();
        expect(operator.permission.admin).toBe(false);
    });

    test("Pulizia database", async function () {
        for (const id of roles_id) { await RoleModel.findByIdAndDelete(id); }
        for (const id of operators_id) { await OperatorModel.findByIdAndDelete(id); }
    });
});

