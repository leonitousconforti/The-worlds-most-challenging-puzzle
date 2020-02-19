const debug = require("debug")("Maze:main");

const server = require("./server.js");
const room = require("./rooms/room.js");
const maze = require("./maze.js").mazeLookup;

// Defines what the game/maze should do for you after every action that you take.
async function gameHandler(currentRoom, doorOption, request, response) {
    debug('processing gmae response for request from room: %s with door selection: %s', currentRoom, doorOption);

    // If the room is part of the maze then...
    if ((currentRoom > 0) && (currentRoom <= 45) || (currentRoom == "prologue")) {

        // Get the next room from the door that the user selected
        let nextRoom = maze[currentRoom].getNewRoomFromOption(doorOption);

        // grab all the files (text and images) that compose the next room
        let nextRoomText = await maze[nextRoom].getRoomText(nextRoom);
        let nextRoomImage = await maze[nextRoom].getRoomImage(nextRoom);

        // Generate html that the browser can render form the next room's text and images
        let html = server.generateHTMLforRoom(nextRoom, nextRoomText, nextRoomImage);

        // Send the html to the player
        response.write(html);
        debug('html for room #%s sent', nextRoom);

        // End the interation
        response.end();
    } else {
        debug('player tried to access a part of the maze that does not exist!');
    }
}

// Starts serving the web files so we can play from a browser
server.init(gameHandler);
