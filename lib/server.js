const url = require("url");
const _ = require("lodash");
const http = require("http");
const user = require("./user.js");
const cookies = require("cookies");
const debug = require("debug")("Maze:server");
const userDatabaseConnection = require("./userDatabaseConnection.js");

// Server utilities
const antiCheatDetection = require("./antiCheat.js");
const generateServerHtml = require("./generateServerHtml").generateHTMLforRoom;

// Cookie signing keys
const signingKeys = ['keyboard cat'];

// All valid server endpoints the player is allowed to access
const validGameEndpoints = ["/prologue", "/room0", "/room1", "/room2", "/room3", "/room4", "/room5", "/room6", "/room7",
    "/room8", "/room9", "/room10", "/room11", "/room12", "/room13", "/room14", "/room15", "/room16", "/room17",
    "/room18", "/room19", "/room20", "/room21", "/room22", "/room23", "/room24", "/room25", "/room26", "/room27",
    "/room28", "/room29", "/room30", "/room31", "/room32", "/room33", "/room34", "/room35", "/room36", "/room37",
    "/room38", "/room39", "/room40", "/room41", "/room42", "/room43", "/room44", "/room45"
];
let server = null;

/**
 * Defines the http server that hosts the files for the web
 * 
 * @param {function} gameHandler the handler function that provides the logic of what to do with the request
 * @param {function} gameRender the handler function that renders each of the html pages
 * @param {int} port the port the server listens on, if on heroku or repl set to process.env.PORT;
 */
function init(gameHandler, gameRender, port) {
    // The port the server listens on, if on heroku or repl set to process.env.PORT (application has to bind to specific assigned port)
    port = _.defaultTo(port, 8080);

    // Create http server
    server = http.createServer(async function(request, response) {
        // init cookies
        let cookie = new cookies(request, response, {
            keys: signingKeys
        });

        // Get the user id
        let userId = cookie.get('user', {
            signed: true
        });

        await userDatabaseConnection.getUser(userId, true)
            .then(function(user) {
                debug("welcome back: %s", user);
                userId = user;
            })
            .catch(function(newUser) {
                debug("welcome new user: %s", newUser);
                cookie.set('user', newUser.id, {
                    signed: true
                });
                userId = newUser;
            });

        // Parse the uri for easier query results
        let parsedUrl = url.parse(request.url, true);

        // If the url just has a '/room#' pathname, then render the scence
        if (
            (validGameEndpoints.indexOf(parsedUrl.pathname) > -1) &&
            (parsedUrl.query.fromRoom == null) &&
            (parsedUrl.query.doorSelection == null)
        ) {
            // Get the room number from the url
            let roomFromUrl = parsedUrl.pathname.split("m")[1];
            if (parsedUrl.pathname == "/prologue") {
                roomFromUrl = 0;
                user.clearTimeline(userId);
            }

            // Render the scene
            gameRender(userId, roomFromUrl, request, response);
        }

        // Otherwise, if the request is because the player has made a request:
        // handle the request first with the maze decision tree and then render the next page
        else if (
            (validGameEndpoints.indexOf(parsedUrl.pathname) > -1) &&
            (parsedUrl.query.fromRoom != null) &&
            (parsedUrl.query.doorSelection != null)
        ) {
            // Get the query params from the uri
            let fromRoom = parsedUrl.query.fromRoom;
            let doorSelection = parsedUrl.query.doorSelection;
            debug('user connected from room: %s, door selection: %s', fromRoom, doorSelection);

            // Maybe do some other authentication here to make sure people don't cheat?
            // Look for and set cookies...
            await antiCheatDetection.checkIfCheating(request, response, parsedUrl)

                // The user is playing by the rules!
                .then(function(goodPlayer) {
                    gameHandler(userId, fromRoom, doorSelection, request, response);
                })

                // Why, why would you ever want to cheat??!
                .catch(function(cheater) {
                    debug('cheater, cheater, cheater! %s', cheater);
                    denyAccess();

                    // End the interaction
                    response.end();
                });
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
            debug('user: %s tried to hit: %s - not a valid game URL access was denied', userId, request.url);
            denyAccess(request, response);
        }
    });

    // Start up the server and listen on port 8080
    server.listen(port, function() {
        debug('server listening @ http://localhost:%i', port);
    });
}

/**
 * A mock 403 forbidden page for if users try to access page outside of the game.
 * 
 * @param {httpRequest} request 
 * @param {httpResponse} response 
 */
function denyAccess(request, response) {
    // Could do something fancy, but we will just send some text for now
    response.write("whoa, you tried to do something you aren't supposed to! try refreshing the page again later");

    // End the interaction
    response.end();
}

// Export some method in this module
module.exports = {
    init,
    validGameEndpoints,
    denyAccess,
    generateServerHtml
};
