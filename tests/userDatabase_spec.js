/**
 *  Tests the functionality of the user database module
 */
const test = require("tap").test;

// Import the current db file and the userDatabase module for testing
const userDB = require("../lib/userDBpersistentStorage.json");
const userDatabaseConnection = require("../lib/userDatabaseConnection.js");

// What the expected outputs should be:
const expectedUser0 = {
    id: 0,
    details: {
        name: "test",
        timeline: [
            "prologue", "room45", "prologue"
        ]
    }
};
const expectedUser1 = {
    id: 1,
    details: {
        name: "another test user",
        timeline: [
            "room45", "prologue", "room45"
        ]
    }
};
const expectedWriteTest = {
    id: 2,
    details: {
        name: "",
        timeline: []
    }
};
const testUsers = {
    0: {
        id: 0,
        details: {
            name: "test",
            timeline: ["prologue", "room45", "prologue"]
        }
    },
    1: {
        id: 1,
        details: {
            name: "another test user",
            timeline: ["room45", "prologue", "room45"]
        }
    }
};

test("should write data to the persistent storage", async function(t) {
    let writtenData = await userDatabaseConnection.updatePersistentStorage({
        data: "test"
    });

    if (writtenData.data != "test") {
        t.fail("did not write data to persistent storage");
    } else {
        t.pass("wrote data to persistent storage");
    }
    t.end();

    await userDatabaseConnection.erasePersistentStorage();
});

test("should erase the persistent storage", async function(t) {
    let dataPoint1 = await userDatabaseConnection.erasePersistentStorage();
    if (JSON.stringify(dataPoint1) != JSON.stringify({})) {
        t.fail("did not erase storage");
    } else {
        t.pass("erased storage");
    }
    t.end();

    await userDatabaseConnection.erasePersistentStorage();
});

test("should read users from the db", async function(t) {
    await userDatabaseConnection.erasePersistentStorage();
    await userDatabaseConnection.updatePersistentStorage(testUsers);

    // Read two test users
    let test1 = await userDatabaseConnection.getUser(0, false);
    let test2 = await userDatabaseConnection.getUser(1, false);

    // Check their properties
    if (JSON.stringify(test1) != JSON.stringify(expectedUser0)) {
        t.fail("did not read user 0 properly");
    } else {
        t.pass("read user");
    }
    if (JSON.stringify(test2) != JSON.stringify(expectedUser1)) {
        t.fail("did not read user 1 properly");
    } else {
        t.pass("read user");
    }

    if (test1.id != 0) {
        t.fail("not parsing user 0 json id");
    } else {
        t.pass("read user");
    }
    if (test2.details.name != "another test user") {
        t.fail("not parsing user 1 json timeline");
    } else {
        t.pass("read user");
    }
    t.end();

    await userDatabaseConnection.erasePersistentStorage();
});

test("should write a user to the db", async function(t) {
    // Erase the storage before testing
    await userDatabaseConnection.erasePersistentStorage();

    // Read the user with uuid: 2, does not exist so it is going to create it
    t.rejects(userDatabaseConnection.getUser(2, true));

    // Read the user with uuid: 2, should exist now
    let readTest3 = await userDatabaseConnection.getUser(2, false);

    // Check functionality
    if (JSON.stringify(readTest3) != JSON.stringify(expectedWriteTest)) {
        t.fail("did not write properly");
    } else {
        t.pass("wrote user");
    }
    t.end();

    await userDatabaseConnection.erasePersistentStorage();
});
