let currentRoom = /* roomNumber */ ;

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
let choice = null;
let elm = document.getElementById("doorRadioButtons");
let html =
    '<li class="buttons-il"><input type="radio" id="f-option" name="selector" onclick="updateDoor(1)"/><label for="f-option">' +
    'Door 1 - Brings you to room #' + doors[0] + '</label><div class="check"></div></li>';
elm.innerHTML += html;

for (let i = 1; i < doors.length; i++) {
    let idd = parseInt(i) + "-option";
    let vis = "visible";

    if ((currentRoom == 29) && (i == doors.length - 1)) {
        vis = "hidden";
    }

    let html = '<li class="buttons-il" style="visibility: ' + vis + '" id=' + (idd + "2") + '><input type="radio" id=' + idd + ' name="selector" onclick="updateDoor(' + (i +
            1) + ')"/><label for=' + idd + '>Door ' + (i + 1) + ' - Brings you to room #' + doors[i] +
        '</label><div class="check"><div class="inside"></div></div></li>';
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

        // Helps prevent cheating because this way disables the back button!
        window.location.replace("./room" + currentRoom + "?fromRoom=" + currentRoom + "&doorSelection=" + choice);
    }
}

function revealSpeacialRoom() {
    if (currentRoom == 29) {
        $("#" + (doors.length - 1) + "-option2").css("visibility", "visible");
    }
}