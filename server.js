const url = require("url");
const http = require("http");
const debug = require("debug")("Maze:server");

const port = 8080;
let server;
let validEndpoints = ["/prologue", "/room1", "/room2", "/"];

/**
 * Defines the http server that hosts the files for the web
 * 
 * @param {function} gameHandler the handler function that provides the logic of what to do with the request
 */
function init(gameHandler) {
    server = http.createServer(function(request, response) {

        // Maybe do some other authentication here to make sure people don't cheat?
        // Look for and set cookies...
        let parsedUrl = url.parse(request.url, true);
        if (
            (validEndpoints.indexOf(parsedUrl.pathname) > -1) && 
            (parsedUrl.query.fromRoom != null) &&
            (parsedUrl.query.doorSelection != null)
        ) {
            // console.log(parsedUrl);
            let fromRoom = parsedUrl.query.fromRoom;
            let doorSelection = parsedUrl.query.doorSelection;

            debug('user connected from room: %s, door selection: %s', fromRoom, doorSelection);
            gameHandler(fromRoom, doorSelection, request, response);
        } else {
            debug('user: %s tried to hit: %s - not a valid game URL access was denied', request.connection.remoteAddress, request.url);
            denyAccess(request, response);
        }
    });

    // Start up the server and listen on port 8080
    server.listen(process.env.PORT || port, function() {
        debug('server listening @ http://localhost:%i', 8080);
    });
}

/**
 * A mock 403 forbiden page for if users try to access page outside of the game.
 * 
 * @param {httpRequest} request 
 * @param {httpResponse} response 
 */
function denyAccess(request, response) {
    // Could do something fancy, but we will just end the response for now
    response.end();
}

/**
 * Converts the image and text files for each room into an html file that the browser can render.
 * 
 * @param roomNumber the room number to generate
 * @param roomText the room text to add
 * @param roomImage the room image to add
 */
function generateHTMLforRoom(roomNumber, roomText, roomImage) {
    debug('making html for room #%s', roomNumber);

    return `

    <!DOCTYPE html>
    <!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
    <!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
    <!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
    <!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title></title>
            <meta name="description" content="">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="">
        </head>
        <body>
            <!--[if lt IE 7]>
                <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="#">upgrade your browser</a> to improve your experience.</p>
            <![endif]-->


            
            <script src="" async defer></script>
        </body>
    </html>
    
    `;
}

module.exports = {
    init,
    generateHTMLforRoom
};
