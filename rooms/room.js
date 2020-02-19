const fs = require("fs");
const path = require("path");
const debug = require("debug")("Maze:room");

/**
 * Defines the properties if a 'room' in the maze.
 */
module.exports.newRoom = function(_location, _doors) {
    debug('making new room @ location: %s, with doors to %o', _location, _doors);

    let location = _location;
    let doors = _doors;

    // Helper for getRoomImage
    let getRoomImage = this.getRoomImage;

    // Helper for getRoomText
    let getRoomText = this.getRoomText;

    // Helper to find out where to go next
    let getNewRoomFromOption = function(option) {
        debug('player in room: %s has selected door/option: %s,', location.toString(), option.toString());
        
        if (option <= 0) {
            debug('you cant do that!');
            return -1;
        }
        return doors[option - 1];
    }

    return {
        location,
        doors,
        getRoomImage,
        getRoomText
    };
}

/**
 * Gets the corresponding image for a room number.
 * 
 * @return Promise that resolves with the image in Base64
 */
module.exports.getRoomImage = function(location) {
    let fileOnDisk = path.join(__dirname, "roomImage-", location);
    debug('fetching image file for room: %s, from file: %s', location, fileOnDisk.toString());

    return new Promise(function(resolve, reject) {
        fs.readFile(fileOnDisk + ".png", function(err, data) {
            if (err) {
                reject(err);
            }

            resolve(data);
        });
    });
}

/**
 * Gets the corresponding text for a room number.
 * 
 * @return Promise that resolves with the text
 */
module.exports.getRoomText = function(location) {
    let fileOnDisk = path.join(__dirname, "roomText-", location);
    debug('fetching text file for room: %s, from file: %s', location, fileOnDisk.toString());

    return new Promise(function(resolve, reject) {
        if (err) {
            reject(err);
        }

        resolve(data);
    });
}
