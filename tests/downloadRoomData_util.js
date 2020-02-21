/* jshint esversion: 8 */
const debug = require("debug")("Maze:test-downloadRoomData");
const fs = require("fs");
const http = require("http");
const path = require("path");
const lodash = require("lodash");
const stream = require("stream").Transform;

/**
 * Downloads all the images for the maze
 */
async function downloadALlImages() {
    debug('downloading all room images into ./../roomData/roomImage-#.jpg');

    // Download 45 times
    for (let i = 1; i < 45; i++) {
        await downloadImage(i);

        // If there is an error, catch the error and log it
        // .catch(function(err) {
        //     console.error(err);
        // });
    }
}

/**
 * Downlaods a particular image
 * 
 * @param {int} roomNum the room number of the image [1, 45]
 */
function downloadImage(roomNum) {
    //http://www.intotheabyss.net/wp-content/uploads/2012/12/Room-01.jpg
    let baseUri = "http://www.intotheabyss.net/wp-content/uploads/2012/12/Room-";

    // Check if you try to download null or undefined or NaN room image
    roomNum = lodash.defaultTo(roomNum, 1);
    if ((roomNum > 45) || (roomNum < 1)) {
        roomNum = 1;
    }

    // If roomNum is less then 10, need to preface it with a zero
    if (roomNum < 10) {
        roomNum = "0" + roomNum.toString() + ".jpg";
    } else {
        roomNum = roomNum.toString() + ".jpg";
    }

    // Return a promise, in case the download takes a while
    return new Promise(function(resolve, reject) {

        // Make the http request to download
        http.request(baseUri + roomNum, function(response) {

            // Create a transform stream to write data to
            let data = new stream();

            // When we recieve a chunk of data, push it to the stream
            response.on('data', function(chunk) {
                data.push(chunk);
            });

            // When we have all the data, push it to a file
            response.on('end', function() {
                fs.writeFile(path.join(__dirname, "../roomData/roomImage-" + roomNum + ".jpg"), data.read(), function(err) {

                    // If there is an error writing to the file, throw the err. Otherwise resolve the promise
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });

                // If fs throws an error while writing to the file, we can not catch it when do a syncronous
                // call because there is not callback function: 
                // fs.writeFileSync(path.join(__dirname, "../roomData/roomImage-" + roomNum + ".jpg"), data.read());
            });

            // If we error, reject the promise
            response.on('error', function(err) {
                reject(err);
            });
        });
    }).end();
}

// For testing
module.exports.downloadImage = downloadImage;
module.exports.downloadALlImages = downloadALlImages;
