/* jshint esversion: 8 */
const debug = require("debug")("Maze:main");

const room = require("./room.js");
const user = require("./user.js");
const server = require("./server.js");
const maze = require("./maze.js").mazeLookup;
const choiceStatistics = require("./choiceCounting.js");
const userDatabaseConnection = require("./userDatabaseConnection.js");

// Start fresh
// userDatabaseConnection.erasePersistentStorage();

// Defines what the game/maze should do for you after every action that you take.
async function gameHandler(player, currentRoom, doorOption, request, response) {
    debug('processing game response for request from room: %s with door selection: %s for user: %s', currentRoom, doorOption, player);

    // If the room is part of the maze then...
    if ((currentRoom >= 0) && (currentRoom <= 45) || (currentRoom == "prologue")) {
        // Get the next room from the door that the user selected
        let nextRoom = maze[currentRoom].getNewRoomFromOption(doorOption);

        // Add it to their timeline
        user.updateTimeline(player, "room" + nextRoom);

        // Update the stats counter
        choiceStatistics.updateStats(currentRoom, doorOption);
        choiceStatistics.pushChangesToFile();

        // Redirect to the next page
        response.writeHead(302, {
            'Location': '/room' + nextRoom
        });

        // End the interaction
        response.end();

        // We do not need to render the scene here because the 302 redirect will cause another http request
        // to the server with just a '/roomNum' pathname which will render the scene.
        // gameRender(nextRoom, request, response);
    } else {
        // You tried to go somewhere where you aren't allowed
        debug('player tried to access a part of the maze that does not exist!');
        server.denyAccess(request, response);
    }
}

// Defines how the game will render each scene in the browser for the player
async function gameRender(player, roomNum, request, response) {
    // Get the room data
    let room = maze[roomNum];

    // grab all the files (text and images) that compose the room
    let roomText = await room.getRoomText(roomNum);
    let roomImage = await room.getRoomImage(roomNum);

    // Collect stats
    let stats = choiceStatistics.getStats(roomNum);

    // Get their timeline
    let timeline = player.details.timeline;

    // Generate html that the browser can render form the next room's text and images
    let html = server.generateServerHtml(roomNum, roomText, roomImage, room.doors, stats, timeline);

    // Send the html to the player
    response.write(html);
    debug('html for room #%s sent', roomNum);

    // End the interaction
    response.end();
}

// Starts serving the web files so we can play from a browser
server.init(gameHandler, gameRender);
