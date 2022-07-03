require('dotenv').config();
const mongoose = require("mongoose");
const utils = require("../../utilities");
const error = require("../../error_handler");
const TopicModel = require("../../models/blog/topic");
const validator = require('express-validator');

async function insertTopic(req, res) {
    
}

async function getTopics(req, res) {
    const topics = await TopicModel.find({}, { _id: 0 }).exec().catch(function (err) { 
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    });
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