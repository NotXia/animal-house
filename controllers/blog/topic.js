require('dotenv').config();
const mongoose = require("mongoose");
const utils = require("../../utilities");
const error = require("../../error_handler");
const TopicModel = require("../../models/blog/topic");
const validator = require('express-validator');

/* Creazione di un nuovo topic */
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

/* Lista di tutti i topic */
async function getTopics(req, res) {
    let topics;

    try {
        topics = await TopicModel.find({}, { _id: 0 }).exec();
        if (topics.length === 0) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    }
    catch (err) {
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.status(utils.http.OK).json(topics);
}

/* Aggiornamento di un topic */
async function updateTopic(req, res) {
    const to_change_topic = req.params.topic;
    const updated_data = validator.matchedData(req, { locations: ["body"] });

    try {
        const updated_topic = await TopicModel.findOneAndUpdate({ name: to_change_topic }, updated_data).exec();
        if (!updated_topic) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    }
    catch (err) {
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.sendStatus(utils.http.OK);
}

/* Cancellazione di un topic */
async function deleteTopic(req, res) {
    const to_delete_topic = req.params.topic;

    try {
        const deleted_topic = await TopicModel.findOneAndDelete({ name: to_delete_topic }).exec();
        if (!deleted_topic) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    }
    catch (err) {
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.sendStatus(utils.http.OK);
}

module.exports = {
    insertTopic: insertTopic,
    getTopics: getTopics,
    updateTopic: updateTopic,
    deleteTopic: deleteTopic
}