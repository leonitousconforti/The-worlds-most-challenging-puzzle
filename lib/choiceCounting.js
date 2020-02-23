/* jshint esversion: 8 */
const fs = require("fs");
const path = require("path");
const maze = require("./maze.js").mazeLookup;
const debug = require("debug")("Maze:choice-statistics");

let stats = require("./choiceStatistics.json");

module.exports.updateStats = function(room, door) {
    stats["room" + room]["door" + door] ++;
};
module.exports.getStats = function(room) {
    let data = [];
    let total = 0;

    // Get the total:
    for (let i = 0; i < maze[room].doors.length; i++) {
        total += stats["room" + room]["door" + (i + 1)];
        data[i] = stats["room" + room]["door" + (i + 1)];
    }
    for (let j = 0; j < data.length; j++) {
        data[j] /= total;
        data[j] *= 100;
        data[j] = data[j].toFixed(1);
    }

    return data;
};

module.exports.pushChangesToFile = function() {
    fs.writeFileSync(path.join(__dirname, "./choiceStatistics.json"), JSON.stringify(stats));
};

/**
 * Resets/clears all the statistics
 */
function resetAllCounts() {
    debug('clearing all statistics');
    let obj = {};

    for (let i = 1; i <= 45; i++) {
        obj["room" + i] = {};

        for (let j = 0; j < maze[i].doors.length; j++) {
            obj["room" + i]["door" + (j + 1)] = 1;
        }
    }

    fs.writeFileSync(path.join(__dirname, "./choiceStatistics.json"), JSON.stringify(obj));
}
