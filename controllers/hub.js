require('dotenv').config();
const HubModel = require("../models/services/hub");
const AddressModel = require("../models/utils/address");
const UserModel = require("../models/auth/user");
const mongoose = require("mongoose");
const utils = require("../utilities");
const error = require("../error_handler");
const validator = require("express-validator");

// Inserimento di un hub
async function insertHub(req, res) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const newHub = new HubModel({
            name: req.body.name,
            address: req.body.address,
            opening_time: req.body.opening_time,
            phone: req.body.phone,
            email: req.body.email
        });
        await newHub.save();
        await session.commitTransaction();
        session.endSession();
        return res.status(utils.http.CREATED).location(`${req.baseUrl}/posts/${newHub._id}`).json(newHub);
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        return res.sendStatus(utils.http.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    insertHub: insertHub,
}