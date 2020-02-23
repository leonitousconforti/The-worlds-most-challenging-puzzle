/**
 * Tests the functionality of the anti-cheat engine
 */
const test = require("tap").test;
const antiCheatDetection = require("../lib/antiCheat.js");

// Define some test params
const testCheatingRequest = {
    pathname: "/room1",
    query: {
        fromRoom: "2",
        doorSelection: null
    }
};
const testNonCheatingRequest = {
    pathname: "/room1",
    query: {
        fromRoom: "1",
        doorSelection: null
    }
};

test("should properly detected if a user is cheating", async function(t) {
    // Check if the user is cheating, which they are so we are expecting the rejected promise
    t.rejects(antiCheatDetection.checkIfCheating(null, null, testCheatingRequest), null);

    // Check if the user is cheating, they are not so we expect the promise to resolve
    let result = await antiCheatDetection.checkIfCheating(null, null, testNonCheatingRequest);
    if (result != "yay!") {
        t.fail("detected false positive");
    } else {
        t.pass("correctly identified player playing by the rules");
    }

    t.end();
});
