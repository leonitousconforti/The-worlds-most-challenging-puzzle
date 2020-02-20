const debug = require("debug")("Maze:main");

const server = require("./server.js");
const room = require("./rooms/room.js");
const maze = require("./maze.js").mazeLookup;

// Defines what the game/maze should do for you after every action that you take.
async function gameHandler(currentRoom, doorOption, request, response) {
    debug('processing gmae response for request from room: %s with door selection: %s', currentRoom, doorOption);

    // If the room is part of the maze then...
    if ((currentRoom >= 0) && (currentRoom <= 45) || (currentRoom == "prologue")) {
        // Get the next room from the door that the user selected
        let nextRoom = maze[currentRoom].getNewRoomFromOption(doorOption);

        // Redirect to the next page
        response.writeHead(302, {'Location': 'http://localhost:8080/room' + nextRoom});

        // We do not need to render the scene here because the 302 redirect will cause another http request
        // to the server with just a '/roomNum' pathname which will render the scene.
        // gameRender(nextRoom, request, response);

        // End the interaction
        response.end();
    } else {
        // You tried to go somewhere where you aren't allowed
        debug('player tried to access a part of the maze that does not exist!');
        server.denyAccess(request, response);
    }
}

// Defines how the game will render each scene in the browser for the player
async function gameRender(roomNum, request, response) {
    // Get the room data
    let room = maze[roomNum];

    // grab all the files (text and images) that compose the room
    let roomText = await room.getRoomText(roomNum);
    let roomImage = await room.getRoomImage(roomNum);
    
    // Generate html that the browser can render form the next room's text and images
    let html = server.generateHTMLforRoom(roomNum, roomText, roomImage, room.doors);

    // Send the html to the player
    response.write(html);
    debug('html for room #%s sent', roomNum);

    // End the interaction
    response.end();
}

// Starts serving the web files so we can play from a browser
server.init(gameHandler, gameRender);
