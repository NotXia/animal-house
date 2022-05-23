require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const OperatorModel = require("./models/auth/operator");
const HubModel = require("./models/services/hub");
const { createTime } = require("./utilities");


async function init() {
    await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`);

    const hq = await new HubModel({
        name: "Sede centrale",
        address: {
            city: "Milano", street: "Via Vincenzo Monti", number: "51", postal_code: "20123"
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

    await new OperatorModel({
        username: "admin",
        password: await bcrypt.hash("admin", parseInt(process.env.SALT_ROUNDS)),
        email: "admin@admin.it",
        name: "Admin",
        surname: "Admin",
        enabled: true,
        permission: { admin: true },
        working_time: {
            monday:     [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub_id: hq._id }],
            tuesday:    [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub_id: hq._id }],
            wednesday:  [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub_id: hq._id }],
            thursday:   [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub_id: hq._id }],
            friday:     [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub_id: hq._id }],
            saturday:   [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub_id: hq._id }],
            sunday:     [{ time: { start: createTime("00:00"), end: createTime("23:59") }, hub_id: hq._id }]
        }
    }).save().catch((err) => { console.log(err.message); });

    await mongoose.connection.close();
};


module.exports = init;

if (!process.env.TESTING) {
    init();
}