require('dotenv').config();
const mongoose = require("mongoose");
const utils = require("../../utilities");
const error = require("../../error_handler");
const TopicModel = require("../../models/blog/topic");

async function insertTopic(req, res) {

}

async function getTopics(req, res) {
    
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