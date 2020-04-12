const debug = require("debug")("Maze:anti-cheat");

/**
 * If you cheat, it knows! (Kinda)
 * 
 * @param {httpRequest} request 
 * @param {httpResponse} response 
 * @return {Promise} rejected if cheater, resolved if you are playing by the rules!
 */
module.exports.checkIfCheating = function(request, response, parsedUri) {
    let roomPath = parsedUri.pathname.split("m")[1];
    let fromRoom = parsedUri.query.fromRoom;

    // Return a promise
    return new Promise(function(resolve, reject) {
        // If they are on two different urls, they are cheating
        if (roomPath != fromRoom) {
            debug('Caught a cheater! (maybe) - %s', request.connection.remoteAddress);
            reject(request.connection.remoteAddress);
        }
        // Otherwise, they are fine
        else {
            resolve("yay!");
        }
    });
};
