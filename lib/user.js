/* jshint esversion: 8 */
const _ = require("lodash");
const uuidv4 = require("uuid/v4");
const debug = require("debug")("Maze:user");
const userDatabaseConnection = require("./userDatabaseConnection.js");

const defaultDetails = {
    "name": "",
    "timeline": []
};

/**
 * Defines the structure for a user
 * 
 * @param {UUID-v4} id the id of the user
 * @param {object} details the details of the user
 */
module.exports.newUser = function(id, details) {
    // Sanitize function imputs
    id = _.defaultTo(id, uuidv4());
    details = _.defaultTo(details, defaultDetails);

    // Helpers for timeline functions
    let updateTimeline = function(data) {
        details.timeline.push(data);
        userDatabaseConnection.updatePersistentStorage();
    };
    let clearTimeline = function() {
        details.timeline = [];
        userDatabaseConnection.updatePersistentStorage();
    };

    // Return an object
    return {
        id,
        details,
        updateTimeline,
        clearTimeline
    };
};

// Helpers for timeline functions
module.exports.updateTimeline = function(user, data) {
    user.details.timeline.push(data);
    userDatabaseConnection.updatePersistentStorage();
};
module.exports.clearTimeline = function(user) {
    user.details.timeline = [];
    userDatabaseConnection.updatePersistentStorage();
};
