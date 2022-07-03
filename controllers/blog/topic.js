require('dotenv').config();
const mongoose = require("mongoose");
const utils = require("../../utilities");
const error = require("../../error_handler");
const TopicModel = require("../../models/blog/topic");
const validator = require('express-validator');

async function insertTopic(req, res) {
    const topic_data = validator.matchedData(req);

    try {
        await new TopicModel(topic_data).save();
    }
    catch (err) {
        if (err.code === utils.MONGO_DUPLICATED_KEY) { return res.status(utils.http.CONFLICT).json(error.formatMessage(utils.http.CONFLICT)); }
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.sendStatus(utils.http.CREATED);
}

async function getTopics(req, res) {
    let topics;

    try {
        topics = await TopicModel.find({}, { _id: 0 }).exec();
        if (topics.length === 0) return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND));
    }
    catch (err) {
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.status(utils.http.OK).json(topics);
}

async function updateTopic(req, res) {

}

async function deleteTopic(req, res) {

}

module.exports = {
    insertTopic: insertTopic,
    getTopics: getTopics,
    updateTopic: updateTopic,
    deleteTopic: deleteTopic
}