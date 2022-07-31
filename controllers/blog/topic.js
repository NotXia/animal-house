require('dotenv').config();
const utils = require("../../utilities");
const error = require("../../error_handler");
const TopicModel = require("../../models/blog/topic");
const validator = require('express-validator');

/* Creazione di un nuovo topic */
async function insertTopic(req, res) {
    const topic_data = validator.matchedData(req);
    let new_topic;

    try {
        new_topic = await new TopicModel(topic_data).save();
    }
    catch (err) {
        if (err.code === utils.MONGO_DUPLICATED_KEY) { err = error.generate.CONFLICT({ field: "name", message: "Esiste già un topic con il nome inserito" }); }
        return error.response(err, res);
    }

    return res.status(utils.http.CREATED).json(new_topic.getData());
}

/* Lista di tutti i topic */
async function getTopics(req, res) {
    let topics;

    try {
        topics = await TopicModel.find({}, { _id: 0 }).exec();
        topics = topics.map(topic => topic.getData());
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(topics);
}

/* Aggiornamento di un topic */
async function updateTopic(req, res) {
    const to_change_topic = req.params.topic;
    const updated_data = validator.matchedData(req, { locations: ["body"] });
    let updated_topic;

    try {
        updated_topic = await TopicModel.findOneAndUpdate({ name: to_change_topic }, updated_data, { new: true }).exec();
        if (!updated_topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(updated_topic.getData());
}

/* Cancellazione di un topic */
async function deleteTopic(req, res) {
    const to_delete_topic = req.params.topic;

    try {
        const deleted_topic = await TopicModel.findOneAndDelete({ name: to_delete_topic }).exec();
        if (!deleted_topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}

module.exports = {
    insertTopic: insertTopic,
    getTopics: getTopics,
    updateTopic: updateTopic,
    deleteTopic: deleteTopic
}