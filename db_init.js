require("dotenv").config();
const bcrypt = require("bcrypt");
const { createTime } = require("./utilities");

const mongoose = require("mongoose");
const UserModel = require("./models/auth/user");
const OperatorModel = require("./models/auth/operator");
const HubModel = require("./models/services/hub");


async function init() {
    await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`);

    const hq = await new HubModel({
        code: "MXP1",
        name: "Sede centrale",
        address: {
            city: "Milano", street: "Via Vincenzo Monti", number: "51", postal_code: "20123"
        },
        position: {
            type: "Point", coordinates: [45.483509, 9.189438]
        },
        opening_time: {
            monday:     [{ start: createTime("00:00"), end: createTime("23:59") }],
            tuesday:    [{ start: createTime("00:00"), end: createTime("23:59") }],
            wednesday:  [{ start: createTime("00:00"), end: createTime("23:59") }],
            thursday:   [{ start: createTime("00:00"), end: createTime("23:59") }],
            friday:     [{ start: createTime("00:00"), end: createTime("23:59") }],
            saturday:   [{ start: createTime("00:00"), end: createTime("23:59") }],
            sunday:     [{ start: createTime("00:00"), end: createTime("23:59") }],
        }
    }).save().catch((err) => { console.log(err.message); });

    
    if (!(await UserModel.findOne({ username: "admin" }).exec())) {
        const admin_user = await new OperatorModel({
            role: "Admin",
            working_time: {
                monday:     [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub: "MXP1" }],
                tuesday:    [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub: "MXP1" }],
                wednesday:  [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub: "MXP1" }],
                thursday:   [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub: "MXP1" }],
                friday:     [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub: "MXP1" }],
                saturday:   [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub: "MXP1" }],
                sunday:     [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub: "MXP1" }]
            }
        }).save().catch((err) => { console.log(err.message); });
        await new UserModel({
            username: "admin",
            password: await bcrypt.hash("admin", parseInt(process.env.SALT_ROUNDS)),
            email: "admin@admin.it",
            name: "Admin",
            surname: "Admin",
            enabled: true,
            permissions: ["admin"],
            type_id: admin_user._id,
            type_name: "operator"
        }).save().catch((err) => { console.log(err.message); });
    }

    await mongoose.connection.close();
};


module.exports = init;

if (!process.env.TESTING) {
    init();
}