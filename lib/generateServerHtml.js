const fs = require("fs");
const path = require("path");
const debug = require("debug")("Maze:generate-server-html");

// Regex expressions
const re_htmlCss = new RegExp("(\\/\\* styleSheet \\*\\/)+", 'ig');
const re_jsRoomNumber = new RegExp("(\\/\\* roomNumber \\*\\/)+", 'ig');
const re_jsDoorArray = new RegExp("(\\/\\* doors \\*\\/)+", 'ig');
const re_htmlImg = new RegExp("(\\/\\* roomImage \\*\\/)+", 'ig');
const re_htmlText = new RegExp("(\\/\\* roomText \\*\\/)+", 'ig');
const re_jsScript = new RegExp("(\\/\\* jsScript \\*\\/)+", 'ig');
const re_percentStats = new RegExp("(\\/\\* percents \\*\\/)+", 'ig');
const re_timelinePlace = new RegExp("(\\/\\* timeline \\*\\/)+", 'ig');

// Get the base html, css, and js from files once so we don't keep opening files
const html = fs.readFileSync(path.join(__dirname, "../public/template.html")).toString();
const css = fs.readFileSync(path.join(__dirname, "../public/style.css")).toString();
const js = fs.readFileSync(path.join(__dirname, "../public/interactive.js")).toString();

/**
 * Converts the image and text files for each room into an html file that the browser can render.
 * 
 * @param roomNumber the room number to generate
 * @param roomText the room text to add
 * @param roomImage the room image to add
 */
module.exports.generateHTMLforRoom = function(roomNumber, roomText, roomImage, doors, stats, timeline) {
    debug('making html for room #%s', roomNumber);

    // Make a copy of the original html so we can modify it
    let _html = html;

    // Do a regex match for the parts we want to replace: ex. the door options, image, and room text
    _html = _html.replace(re_jsScript, js);
    _html = _html.replace(re_htmlCss, css);
    _html = _html.replace(re_jsDoorArray, doors);
    _html = _html.replace(re_jsRoomNumber, roomNumber);
    _html = _html.replace(re_htmlImg, roomImage);
    _html = _html.replace(re_htmlText, roomText);
    _html = _html.replace(re_percentStats, stats);
    _html = _html.replace(re_timelinePlace, timeline);

    // Return the final html
    return _html;
};
