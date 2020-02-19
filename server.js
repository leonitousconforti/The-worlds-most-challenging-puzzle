const fs = require("fs");
const url = require("url");
const http = require("http");
const request = require("request");
const debug = require("debug")("Maze:server");

const port = 8080;
const validEndpoints = ["/prologue", "/room0", "/room1", "/room2", "/room3", "/room4", "/room5", "/room6", "/room7", 
                      "/room8", "/room9", "/room10", "/room11", "/room12", "/room13", "/room14", "/room15", "/room16", "/room17", 
                      "/room18", "/room19", "/room20", "/room21", "/room22", "/room23", "/room24", "/room25", "/room26", "/room27", 
                      "/room28", "/room29", "/room30", "/room31", "/room32", "/room33", "/room34", "/room35", "/room36", "/room37", 
                      "/room38", "/room39", "/room40", "/room41", "/room42", "/room43", "/room44", "/room45", "/"
                    ];
let server;

/**
 * Defines the http server that hosts the files for the web
 * 
 * @param {function} gameHandler the handler function that provides the logic of what to do with the request
 * @param {function} gameRender the handler function that renders each of the html pages
 */
function init(gameHandler, gameRender) {
    server = http.createServer(function(request, response) {

        // Maybe do some other authentication here to make sure people don't cheat?
        // Look for and set cookies...
        let parsedUrl = url.parse(request.url, true);
        
        // If the url just has a '/room#' pathname, then render the scence
        if (
            (validEndpoints.indexOf(parsedUrl.pathname) > -1) && 
            (parsedUrl.query.fromRoom == null) &&
            (parsedUrl.query.doorSelection == null)
        ) {
            // Get the room number from the url
            let roomFromUrl = parsedUrl.pathname.split("m")[1];

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
            let fromRoom = parsedUrl.query.fromRoom;
            let doorSelection = parsedUrl.query.doorSelection;

            debug('user connected from room: %s, door selection: %s', fromRoom, doorSelection);
            gameHandler(fromRoom, doorSelection, request, response);
        } 
        // OtherOtherWise, the player tried to do something they were not supposed to do!
        else {
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

            <p>You are in room: ${roomNumber}</p>
            <img src="data:image/png;base64, ${roomImage}" alt="" />
            
            <script src="" async defer></script>
        </body>
    </html>
    
    `;
}

/**
 * Downloads all the images for the maze
 */
function downloadALlImages() {
    //http://www.intotheabyss.net/wp-content/uploads/2012/12/Room-07.jpg
    let baseUri = "http://www.intotheabyss.net/wp-content/uploads/2012/12/Room-";

    // Loop 45 times to download all 45 images
    for (let i = 1; i <= 45; i++) {
        let url = baseUri;

        // If the counter is less then 10, add a '0' before the number
        if (i < 10) {
            url = url + "0" + i + ".jpg";
        } else {
            url = url + i + ".jpg";
        }

        // Send a http head request
        request.head(url, function(err, response, body) {
            console.log('content-type:', response.headers['content-type']);
            console.log('content-length:', response.headers['content-length']);

            // Download the image and send the binary response to a file
            request(url).pipe(fs.createWriteStream("./rooms/roomImage-" + i + ".jpg"));
        });
    }
}

module.exports = {
    init,
    generateHTMLforRoom,
    validEndpoints,
    denyAccess
};
