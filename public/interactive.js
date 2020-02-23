let currentRoom = /* roomNumber */ ;
let room0 = "prologue", room1 = "room1",room2 = "room2",room3 = "room3",room4 = "room4",room5 = "room5",room6 = "room6",room7 = "room7",room8 = "room8",room9 = "room9",room10 = "room10",room11 = "room11",room12 = "room12",room13 = "room13",room14 = "room14",room15 = "room15",room16 = "room16",room17 = "room17",room18 = "room18",room19 = "room19",room20 = "room20",room21 = "room21",room22 = "room22",room23 = "room23",room24 = "room24",room25 = "room25",room26 = "room26",room27 = "room27",room28 = "room28",room29 = "room29",room31 = "room31",room32 = "room32",room33 = "room33",room34 = "room34",room35 = "room35",room36 = "room36",room37 = "room37",room38 = "room38",room39 = "room39",room40 = "room40",room41 = "room41",room42 = "room42",room43 = "room43",room44 = "room44",room45 = "room45";

$("document").ready(function () {
    $(".tab-slider--body").hide();
    $(".tab-slider--body:first").show();

    if (currentRoom != 0) {
        $('.alert').hide();
    } else if ($(window).width() > 786) {
        $('.alert').css("visibility", "visible");
        $('.alert').hide().delay(750).slideDown(400);
    }

    $('.close_btn').click(function () {
        $('.close_btn').fadeOut(200);
        $('.alert').slideUp(400);
    });
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

let doors = [ /* doors */ ];
let percents = [ /* percents */ ];
let timeLines = [ /* timeline */ ];
let choice = null;
let elm = document.getElementById("doorRadioButtons");
let html =
    '<li class="buttons-il"><input type="radio" id="f-option" name="selector" onclick="updateDoor(1)"/><label for="f-option">' +
    'Door 1 - Brings you to room #' + doors[0] + '</label><div id="percent' + 0 + '" class="percent" style="margin-top: 5%;">' + percents[0] + '%</div><div class="check"></div></li>';
elm.innerHTML += html;

for (let i = 1; i < doors.length; i++) {
    let idd = parseInt(i) + "-option";
    let vis = "visible";

    if ((currentRoom == 29) && (i == doors.length - 1)) {
        vis = "hidden";
    }

    let html = '<li class="buttons-il" style="visibility: ' + vis + '" id=' + (idd + "2") + '><input type="radio" id=' + idd + ' name="selector" onclick="updateDoor(' + (i +
            1) + ')"/><label for=' + idd + '>Door ' + (i + 1) + ' - Brings you to room #' + doors[i] +
        '</label><div id="percent' + i + '" class="percent" style="margin-top:' + (i * 1 + 3) + '%;">' + percents[i] + '%</div><div class="check"><div class="inside"></div></div></li>';
    elm.innerHTML += html;
}

function updateDoor(num) {
    $(".continueButton").addClass("continueButtonInactive");
    $(".continueButton").addClass("continueButtonActive");

    for (let i = 0; i < doors.length; i++) {
        let elm = document.getElementById("percent" + i);
        elm.style.visibility = "visible";
    }

    choice = num;
}

function continueGame() {
    if (choice != null) {
        console.log("here");

        // Helps prevent cheating because this way disables the back button!
        window.location.replace("./room" + currentRoom + "?fromRoom=" + currentRoom + "&doorSelection=" + choice);
    }
}

function revealSpeacialRoom() {
    if (currentRoom == 29) {
        $("#" + (doors.length - 1) + "-option2").css("visibility", "visible");
    }
}

let timelineElm = document.getElementById("timelinesssss");
for (let i = 0; i < timeLines.length; i++) {
    let dir = "r";
    if (i % 2 == 0) {
        dir = "l";
    }

    let baseTimelineHtml = '<li><div class="direction-' + dir + '"><div class="flag-wrapper"><span class="flag">' + timeLines[i] + '</span></div></li>';
    timelineElm.innerHTML += baseTimelineHtml;
}
