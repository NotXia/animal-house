require('dotenv').config();
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
        if (err.code === utils.MONGO_DUPLICATED_KEY) { err = error.generate.CONFLICT({ field: "name", message: "Esiste già un topic con il nome inserito" }); }
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.CREATED);
}

/* Lista di tutti i topic */
async function getTopics(req, res) {
    let topics;

    try {
        topics = await TopicModel.find({}, { _id: 0 }).exec();
        if (topics.length === 0) { throw error.generate.NOT_FOUND("Non ci sono topic"); }
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

    try {
        const updated_topic = await TopicModel.findOneAndUpdate({ name: to_change_topic }, updated_data).exec();
        if (!updated_topic) { throw error.generate.NOT_FOUND("Topic inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.OK);
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

    return res.sendStatus(utils.http.OK);
}

module.exports = {
    insertTopic: insertTopic,
    getTopics: getTopics,
    updateTopic: updateTopic,
    deleteTopic: deleteTopic
}