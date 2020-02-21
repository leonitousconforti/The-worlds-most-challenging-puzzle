/* jshint esversion: 8 */
const fs = require("fs");
const url = require("url");
const http = require("http");
const path = require("path");
const debug = require("debug")("Maze:server");

// The port the server listens on, if on heroku or repl set to null (application has to bind to specific assigned port)
const port = 8080;

// All valid server endpoints the player is allowed to access
const validEndpoints = ["/prologue", "/room0", "/room1", "/room2", "/room3", "/room4", "/room5", "/room6", "/room7",
    "/room8", "/room9", "/room10", "/room11", "/room12", "/room13", "/room14", "/room15", "/room16", "/room17",
    "/room18", "/room19", "/room20", "/room21", "/room22", "/room23", "/room24", "/room25", "/room26", "/room27",
    "/room28", "/room29", "/room30", "/room31", "/room32", "/room33", "/room34", "/room35", "/room36", "/room37",
    "/room38", "/room39", "/room40", "/room41", "/room42", "/room43", "/room44", "/room45"
];
let server = null;

// Regex expresions
const re_htmlCss = new RegExp("(\\/\\* styleSheet \\*\\/)+", 'ig');
const re_jsRoomNumber = new RegExp("(\\/\\* roomNumber \\*\\/)+", 'ig');
const re_jsDoorArray = new RegExp("(\\/\\* doors \\*\\/)+", 'ig');
const re_htmlImg = new RegExp("(\\/\\* roomImage \\*\\/)+", 'ig');
const re_htmlText = new RegExp("(\\/\\* roomText \\*\\/)+", 'ig');
const re_jsScript = new RegExp("(\\/\\* jsScript \\*\\/)+", 'ig');

/**
 * Defines the http server that hosts the files for the web
 * 
 * @param {function} gameHandler the handler function that provides the logic of what to do with the request
 * @param {function} gameRender the handler function that renders each of the html pages
 */
function init(gameHandler, gameRender) {
    // Create http server
    server = http.createServer(async function(request, response) {

        // Maybe do some other authentication here to make sure people don't cheat?
        // Look for and set cookies...
        await antiCheatDetection(request, response)

        // The user is playing by the rules!
        .then(function(goodPlayer) {

            // Parse the uri for easier query results
            let parsedUrl = url.parse(request.url, true);

            // If the url just has a '/room#' pathname, then render the scence
            if (
                (validEndpoints.indexOf(parsedUrl.pathname) > -1) &&
                (parsedUrl.query.fromRoom == null) &&
                (parsedUrl.query.doorSelection == null)
            ) {
                // Get the room number from the url
                let roomFromUrl = parsedUrl.pathname.split("m")[1];
                if (parsedUrl.pathname == "/prologue") {
                    roomFromUrl = 0;
                }

                // Render the scene
                gameRender(roomFromUrl, request, response);
            }

            // Otherwise, if the request is because the player has made a request:
            // handle the request first with the maze decision tree and then render the next page
            else if (
                (validEndpoints.indexOf(parsedUrl.pathname) > -1) &&
                (parsedUrl.query.fromRoom != null) &&
                (parsedUrl.query.doorSelection != null)
            ) {
                // Get the query params from the uri
                let fromRoom = parsedUrl.query.fromRoom;
                let doorSelection = parsedUrl.query.doorSelection;

                debug('user connected from room: %s, door selection: %s', fromRoom, doorSelection);
                gameHandler(fromRoom, doorSelection, request, response);
            }

            // When the user first visits the site, redirect to the /prologue page for an introduction
            else if (parsedUrl.pathname == "/") {
                response.writeHead(302, {
                    'Location': '/prologue'
                });

                // End the interaction
                response.end();
            }

            // OtherOtherWise, the player tried to do something they were not supposed to do!
            else {
                debug('user: %s tried to hit: %s - not a valid game URL access was denied', request.connection.remoteAddress, request.url);
                denyAccess(request, response);
            }
        })
        
        // Why, why would you ever want to cheat??!
        .catch(function(cheater) {
            console.log("Cheater! Cheater! Cheater!");
            denyAccess();

            // End the interaction
            response.end();
        });
    });

    // Start up the server and listen on port 8080
    server.listen(process.env.PORT || port, function() {
        debug('server listening @ http://localhost:%i', 8080);
    });
}

/**
 * If you cheat, it knows!
 * 
 * @param {httpRequest} request 
 * @param {httpResponse} response 
 * @return {Promise} rejected if cheater, resolved if you are playing by the rules!
 */
function antiCheatDetection(request, response) {

    // Return a promise
    return new Promise(function(resolve, reject) {
        resolve("Yay!");
    });
}

/**
 * A mock 403 forbiden page for if users try to access page outside of the game.
 * 
 * @param {httpRequest} request 
 * @param {httpResponse} response 
 */
function denyAccess(request, response) {
    // Could do something fancy, but we will just send some text for now
    response.write("whoa, you tried to do something you aren't suposed to! try refresing the page again later");
    
    // End the interaction
    response.end();
}

/**
 * Converts the image and text files for each room into an html file that the browser can render.
 * 
 * @param roomNumber the room number to generate
 * @param roomText the room text to add
 * @param roomImage the room image to add
 */
function generateHTMLforRoom(roomNumber, roomText, roomImage, doors) {
    debug('making html for room #%s', roomNumber);

    // Get the base html
    let html = fs.readFileSync(path.join(__dirname, "../public/template.html")).toString();

    // Get the base css
    let css = fs.readFileSync(path.join(__dirname, "../public/style.css")).toString();

    // Get the js
    let js = fs.readFileSync(path.join(__dirname, "../public/interactive.js")).toString();


    // Do a regex match for the parts we want to replace: ex. the door options, image, and room text
    html = html.replace(re_jsScript, js);
    html = html.replace(re_htmlCss, css);
    html = html.replace(re_jsDoorArray, doors);
    html = html.replace(re_jsRoomNumber, roomNumber);
    html = html.replace(re_htmlImg, roomImage);
    html = html.replace(re_htmlText, roomText);
    
    // Return the final html
    return html;
}

// Export some method in this module
module.exports = {
    init,
    antiCheatDetection,
    validEndpoints,
    denyAccess,
    generateHTMLforRoom
};
