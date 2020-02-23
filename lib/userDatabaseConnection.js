/* jshint esversion: 8 */
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const user = require("./user.js");
const debug = require("debug")("Maze:user-database");

// Read the users.json file
let userDB = require("./userDBpersistentStorage.json");

/**
 * Gets the selected user by id
 * 
 * @param {UUID-v4} id the id of the user
 * @param {boolean} createIfNotExist creates the user if it does not exist
 * @return {Promise} resolves with the user, rejects if user does not exists
 */
module.exports.getUser = function(id, createIfNotExist) {
    id = _.defaultTo(id, 0);
    debug("checking user database for user %s", id);

    // Sanitize user input
    createIfNotExist = _.defaultTo(createIfNotExist, false);

    // Return a promise
    return new Promise(function(resolve, reject) {

        // If the user exists
        if (_.has(userDB, id)) {
            debug("found user %s in db", id.toString());
            let person = userDB[id];
            resolve(person);
        } else {
            // Otherwise, the user does not exist - so lets create it
            if (createIfNotExist) {
                debug("creating user %s and saving in db", id.toString());
                if (id == 0) {
                    id = null;
                }

                let newPerson = user.newUser(id);
                userDB[newPerson.id.toString()] = newPerson;
                updatePersistentStorage(userDB);
                reject(newPerson);
            } else {
                debug("user %s was not in the db, not creating user", id.toString());

                // Reject if we haven't yet
                reject(null);
            }
        }
    });
};

/**
 * Writes all local changes saved in the buffer to local persistent storage
 * 
 * @param {object} data the data to write
 */
function updatePersistentStorage(data) {
    debug('updating json file');
    let fileDescriptor = path.join(__dirname, "./userDBpersistentStorage.json");
    data = _.defaultTo(data, userDB);

    return new Promise(function(resolve, reject) {
        fs.writeFileSync(fileDescriptor, JSON.stringify(data));
        // fs.writeFile(path.join(__dirname, "./userDBpersistentStorage.json"), JSON.stringify(data), function(err) {
        //     if (err) {
        //         reject(err);
        //     }
        // });

        let updatedData = JSON.parse(fs.readFileSync(fileDescriptor));
        // fs.readFile(path.join(__dirname, "./userDBpersistentStorage.json"), function(err, data) {
        //     if (err) {
        //         reject(err);
        //     } else {
        //         data = JSON.parse(data);
        //         userDB = data;
        //         resolve(data);
        //     }
        // });
        userDB = updatedData;
        resolve(updatedData);
    });
}

/**
 * Erases the db file
 */
function erasePersistentStorage() {
    return new Promise(async function(resolve, reject) {

        await updatePersistentStorage({})
            .then(function(data) {
                resolve(data);
            })
            .catch(function(err) {
                reject(err);
            });

    });
}

// For testing
module.exports.erasePersistentStorage = erasePersistentStorage;
module.exports.updatePersistentStorage = updatePersistentStorage;
