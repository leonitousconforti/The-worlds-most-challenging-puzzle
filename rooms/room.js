const fs = require("fs");
const path = require("path");
const debug = require("debug")("Maze:room");

/**
 * Defines the properties of a 'room' in the maze.
 */
module.exports.newRoom = function(_location, _doors) {
    debug('making new room at position: %s, with doors to %o', _location, _doors);

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

    // Return the params of the room
    return {
        location,
        doors,
        getRoomImage,
        getRoomText,
        getNewRoomFromOption
    };
}

/**
 * Gets the corresponding image for a room number.
 * 
 * @param location the room number
 * @return Promise that resolves with the image in Base64
 */
module.exports.getRoomImage = function(location) {
    let fileOnDisk = path.join(__dirname, "roomImage-" + location.toString());
    debug('fetching image file for room: %s, from file: %s.png', location, fileOnDisk.toString());

    // Return a promise to wait for the data from the file
    return new Promise(function(resolve, reject) {
        fs.readFile(fileOnDisk + ".png", function(err, data) {
            if (err) {
                reject(err);
            }

            // Convert binary data to base64 encoded string
            let base64 = new Buffer(data).toString('base64');
            resolve(base64);
        });
    });
}

/**
 * Gets the corresponding text for a room number.
 * 
 * @param location the room number
 * @return Promise that resolves with the text
 */
module.exports.getRoomText = function(location) {
    let fileOnDisk = path.join(__dirname, "roomText-" + location.toString());
    debug('fetching text file for room: %s, from file: %s.txt', location, fileOnDisk.toString());

    // Return a promise to wait for the data from the file
    return new Promise(function(resolve, reject) {
        fs.readFile(fileOnDisk + ".txt", function(err, data) {
            if (err) {
                reject(err);
            }

            resolve(data);
        });
    });
}
