require("dotenv").config();
const bcrypt = require("bcrypt");
const { createTime } = require("./utilities");

const mongoose = require("mongoose");
const UserModel = require("./models/auth/user");
const OperatorModel = require("./models/auth/operator");
const HubModel = require("./models/services/hub");
const PermissionModel = require("./models/auth/permission");


async function init() {
    if (process.env.PROTECTED_DB) { await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}?authSource=admin`); }
    else { await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`); }

    try {
        await new PermissionModel({ name: "admin", urls: [""] }).save();
        await new PermissionModel({ name: "operator", urls: [""] }).save();
        await new PermissionModel({ name: "customer", urls: [""] }).save();
        await new PermissionModel({ name: "post_write", urls: [""] }).save();
        await new PermissionModel({ name: "comment_write", urls: [""] }).save();
        await new PermissionModel({ name: "warehouse", urls: [""] }).save();
        await new PermissionModel({ name: "shop_write", urls: [""] }).save();
    } catch(err) {}

    try {
        const hq = await new HubModel({
            code: "MXP1",
            name: "Sede centrale",
            address: { city: "Milano", street: "Via Vincenzo Monti", number: "51", postal_code: "20123" },
            position: { type: "Point", coordinates: [45.483509, 9.189438] },
            opening_time: {
                monday:     [{ start: createTime("00:00"), end: createTime("23:59") }],
                tuesday:    [{ start: createTime("00:00"), end: createTime("23:59") }],
                wednesday:  [{ start: createTime("00:00"), end: createTime("23:59") }],
                thursday:   [{ start: createTime("00:00"), end: createTime("23:59") }],
                friday:     [{ start: createTime("00:00"), end: createTime("23:59") }],
                saturday:   [{ start: createTime("00:00"), end: createTime("23:59") }],
                sunday:     [{ start: createTime("00:00"), end: createTime("23:59") }],
            }
        }).save();
    } catch(err) {}

    try {
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
            }).save();

            await new UserModel({
                username: "admin",
                password: await bcrypt.hash("admin", parseInt(process.env.SALT_ROUNDS)),
                email: "admin@admin.it",
                name: "Admin",
                surname: "Admin",
                enabled: true,
                permissions: ["admin"],
                gender: "Altro",
                type_id: admin_user._id,
                type_name: "operator"
            }).save();
        }
    } catch(err) {}
    
    await mongoose.connection.close();
    await mongoose.disconnect();
};


module.exports = init;

if (!process.env.TESTING) {
    init();
}