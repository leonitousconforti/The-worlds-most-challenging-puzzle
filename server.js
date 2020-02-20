const fs = require("fs");
const url = require("url");
const http = require("http");
const request = require("request");
const debug = require("debug")("Maze:server");

// The port the server listens on, if on heroku or repl set to null (application has to bind to specific assigned port)
const port = 8080;
// All valid server endpoints the player is allowed to access
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
            if (parsedUrl.pathname == "/prologue") {
                roomFromUrl = 0;
            }

            if (roomFromUrl == null) {
                response.writeHead(302, {'Location': 'http://localhost:8080/prologue'});
                response.end();
            } else {
                // Render the scene
                gameRender(roomFromUrl, request, response);
            }
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
function generateHTMLforRoom(_roomNumber, _roomText, _roomImage, _doors) {
    debug('making html for room #%s', _roomNumber);

    return `

    <!DOCTYPE html>
    <!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
    <!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
    <!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
    <!--[if gt IE 8]><!-->
    <html class="no-js">
    <!--<![endif]-->
    
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>The Maze</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <!-- <link rel="stylesheet" href=""> -->
    
        <style>
            @import url("https://fonts.googleapis.com/css?family=Lato");
            @import url(https://fonts.googleapis.com/css?family=Muli);
    
            body,
            html {
                height: 100%;
                background: #222222;
                font-family: "Muli", "Lato", sans-serif;
            }
    
            .buttonscontainer {
                display: block;
                position: relative;
                margin: 40px auto;
                height: auto;
                width: 500px;
                padding: 20px;
            }
    
            h2 {
                color: #aaaaaa;
            }
    
            .buttonscontainer ul {
                list-style: none;
                margin: 0;
                padding: 0;
                overflow: auto;
            }
    
            .buttons-ul .buttons-il {
                color: #aaaaaa;
                display: block;
                position: relative;
                float: left;
                width: 100%;
                height: 100px;
                border-bottom: 1px solid #333;
            }
    
            .buttons-ul .buttons-il input[type="radio"] {
                position: absolute;
                visibility: hidden;
            }
    
            .buttons-ul .buttons-il label {
                display: block;
                position: relative;
                font-weight: 300;
                font-size: 1.35em;
                padding: 25px 25px 25px 80px;
                margin: 10px auto;
                height: 30px;
                z-index: 9;
                cursor: pointer;
                -webkit-transition: all 0.25s linear;
            }
    
            .buttons-ul .buttons-il:hover label {
                color: #ffffff;
            }
    
            .buttons-ul .buttons-il .check {
                display: block;
                position: absolute;
                border: 5px solid #aaaaaa;
                border-radius: 100%;
                height: 25px;
                width: 25px;
                top: 30px;
                left: 20px;
                z-index: 5;
                transition: border 0.25s linear;
                -webkit-transition: border 0.25s linear;
            }
    
            .buttons-ul .buttons-il:hover .check {
                border: 5px solid #ffffff;
            }
    
            .buttons-ul .buttons-il .check::before {
                display: block;
                position: absolute;
                content: "";
                border-radius: 100%;
                height: 15px;
                width: 15px;
                top: 5px;
                left: 5px;
                margin: auto;
                transition: background 0.25s linear;
                -webkit-transition: background 0.25s linear;
            }
    
            input[type="radio"]:checked~.check {
                border: 5px solid #0dff92;
            }
    
            input[type="radio"]:checked~.check::before {
                background: #0dff92;
            }
    
            input[type="radio"]:checked~label {
                color: #0dff92;
            }
    
            .signature {
                margin: 10px auto;
                padding: 10px 0;
                width: 100%;
            }
    
            .signature p {
                text-align: center;
                font-family: Muli, Helvetica, Arial, Sans-Serif;
                font-size: 0.85em;
                color: #aaaaaa;
            }
    
            .signature .much-heart {
                display: inline-block;
                position: relative;
                margin: 0 4px;
                height: 10px;
                width: 10px;
                background: #ac1d3f;
                border-radius: 4px;
                -ms-transform: rotate(45deg);
                -webkit-transform: rotate(45deg);
                transform: rotate(45deg);
            }
    
            .signature .much-heart::before,
            .signature .much-heart::after {
                display: block;
                content: "";
                position: absolute;
                margin: auto;
                height: 10px;
                width: 10px;
                border-radius: 5px;
                background: #ac1d3f;
                top: -4px;
            }
    
            .signature .much-heart::after {
                bottom: 0;
                top: auto;
                left: -4px;
            }
    
            .signature a {
                color: #aaaaaa;
                text-decoration: none;
                font-weight: bold;
            }
    
            .container {
                width: 75%;
                margin: 3rem auto;
            }
    
            h2 {
                color: #345f90;
                font-size: 24px;
                line-height: 1.25;
                font-family: Muli, "Roboto Slab", serif;
                margin-top: 20px;
                margin-bottom: 20px;
            }
    
            .tab-slider--nav {
                width: 100%;
                float: left;
                margin-bottom: 20px;
            }
    
            .tab-slider--tabs {
                display: block;
                float: left;
                margin: 0;
                padding: 0;
                list-style: none;
                position: relative;
                border-radius: 35px;
                overflow: hidden;
                background: #fff;
                height: 35px;
                user-select: none;
            }
    
            .tab-slider--tabs:after {
                content: "";
                width: 50%;
                background: #345f90;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                transition: all 250ms ease-in-out;
                border-radius: 35px;
            }
    
            .tab-slider--tabs.slide:after {
                left: 50%;
            }
    
            .tab-slider--trigger {
                font-size: 12px;
                line-height: 1;
                font-weight: bold;
                color: #345f90;
                text-transform: uppercase;
                text-align: center;
                padding: 11px 20px;
                position: relative;
                z-index: 2;
                cursor: pointer;
                display: inline-block;
                transition: color 250ms ease-in-out;
                user-select: none;
            }
    
            .tab-slider--trigger.active {
                color: #fff;
            }
    
            .tab-slider--body {
                margin-bottom: 20px;
            }

            .continueButton {
                display: block;
                position: relative;
                transition: all .5s ease;
                font-family: Muli, 'Montserrat', sans-serif;
                text-transform: uppercase;
                text-align: center;
                line-height: 1;
                font-size: 17px;
                background-color : transparent;
                padding: 10px;
                outline: none;
                border-radius: 4px;
                width: 25%;
                margin-left: 37.5%;
                margin-right: 37.5%;
                margin-top: 10%;
            }
            
            .continueButtonInactive {
                color: #222222;
                border: 3px solid #222222;
            }

            .continueButtonActive {
                color: #fff;
                border: 3px solid #fff;
            }

            .continueButtonActive:hover {
                color: #001F3F;
                background-color: #fff;
            }
        </style>
    </head>
    
    <body>
        <!--[if lt IE 7]>
          <p class="browsehappy">
            You are using an <strong>outdated</strong> browser. Please
            <a href="#">upgrade your browser</a> to improve your experience.
          </p>
        <![endif]-->
    
        <div class="container">
            <div class="tab-slider--nav">
                <ul class="tab-slider--tabs">
                    <li class="tab-slider--trigger active" rel="mazeRoomTab">
                        Room
                    </li>
                    <li class="tab-slider--trigger" rel="roomSelectionTab">
                        Choice
                    </li>
                </ul>
            </div>
            <div class="tab-slider--container">
                <div id="mazeRoomTab" class="tab-slider--body">
                    <h2 style="visibility:hidden"> . </h2>

                    <img src="data:image/png;base64, ${_roomImage}" alt="" />
                </div>
                <div id="roomSelectionTab" class="tab-slider--body">
                    <h2 style="visibility:hidden"> . </h2>
    
                    <div class="buttonscontainer">
                        <h2>What door do you choose?</h2>
    
                        <ul class="buttons-ul" id="doorRadioButtons"></ul>
                        <button class="continueButton continueButtonInactive" id="continueButton" onclick="continueGame()">Continue!</button>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="signature">
            <p>Made with <i class="much-heart"></i> by Leo Conforti</p>
            <p>Images and text copyright 1985 by Christopher Manson</p>
        </div>
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script async defer>
            $("document").ready(function () {
                $(".tab-slider--body").hide();
                $(".tab-slider--body:first").show();
            });
    
            $(".tab-slider--nav li").click(function () {
                $(".tab-slider--body").hide();
                var activeTab = $(this).attr("rel");
                $("#" + activeTab).fadeIn();
                if ($(this).attr("rel") == "roomSelectionTab") {
                    $(".tab-slider--tabs").addClass("slide");
                } else {
                    $(".tab-slider--tabs").removeClass("slide");
                }
                $(".tab-slider--nav li").removeClass("active");
                $(this).addClass("active");
            });
    
            let currentRoom = ${_roomNumber};
            let doors = [${_doors}];
            let choice = null;
            let elm = document.getElementById("doorRadioButtons");
            let html = '<li class="buttons-il"><input type="radio" id="f-option" name="selector" onclick="updateDoor(1)"/><label for="f-option">' + 'Door 1 - Brings you to room #' + doors[0] + '</label><div class="check"></div></li>';
            elm.innerHTML += html;
    
            for (let i = 1; i < doors.length; i++) {
                let idd = parseInt(i) + "-option";
    
                let html = '<li class="buttons-il"><input type="radio" id=' + idd + ' name="selector" onclick="updateDoor(' + (i + 1) + ')"/><label for=' + idd + '>Door ' + (i + 1) + ' - Brings you to room #' + doors[i] + '</label><div class="check"><div class="inside"></div></div></li>';
                elm.innerHTML += html;
            }

            function updateDoor(num) {
                $(".continueButton").addClass("continueButtonInactive");
                $(".continueButton").addClass("continueButtonActive");
                choice = num;
            }

            function continueGame() {
                if (choice != null) {
                    console.log("here");

                    window.location.replace("http://localhost:8080?fromRoom=" + currentRoom + "&doorSelection=" + choice);
                }
            }
        </script>
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
