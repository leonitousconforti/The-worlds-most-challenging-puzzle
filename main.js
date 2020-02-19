const http = require('http');
const debug = require('debug')('Maze:main');

const room = require('./rooms/room.js');
const maze = require('./maze.js').mazeLookup;

http.createServer(function(request, response) {
    if (request.url) {
        
    }
}).listen(process.env.PORT || 8080, function() {
    debug('http server up @ http://localhost:%n', 8080);
});

