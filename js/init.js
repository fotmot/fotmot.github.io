loadSettings();
//0x0112 : "Orientation",
var token = get_cookie("yat");
$(function () {
    // Handler for .ready() called.
    $("#content").dblclick(performClick);
    if (token === null) {
        document.location = 'autorize.html';
    } else {
        go();
        if (getSettings('crop')) {
            maximize();
        }
        if (getSettings('motion')) {
            disableMove();
        }
        if (getSettings('folder')) {

        }
    }

    //close popup1
    $('#popup1').on('click', function (event) {
        if ($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') || $(event.target).is('.but-close')) {
            event.preventDefault();
            $(this).removeClass('is-visible');
            play();
        } else if ($(event.target).is('.but-yes')) {
            event.preventDefault();
            del();
            $(this).removeClass('is-visible');
        }
    });

    //close popup when clicking the esc keyboard button
    $(document).keyup(function (event) {
        var popup1 = $('#popup1');
        if (event.which == '27' && popup1.hasClass('is-visible')) {
            popup1.removeClass('is-visible');
            play();
        }
    });

    //close popup1
    $('#popup2').on('click', function (event) {
        if ($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') || $(event.target).is('.but-close')) {
            event.preventDefault();
            $(this).removeClass('is-visible');

        } else if ($(event.target).is('.but-yes')) {
            event.preventDefault();
            setFolder($('#selectfolders').val());
            $(this).removeClass('is-visible');
        }
    });
    $('#popup3').on('click', function (event) {
        if ($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') || $(event.target).is('.but-close')) {
            event.preventDefault();
            $(this).removeClass('is-visible');
        }
    });

    //close popup when clicking the esc keyboard button
    $(document).keyup(function (event) {
        var popup1 = $('#popup1');
        var popup2 = $('#popup2');
        var popup3 = $('#popup3');
        if (event.which == '27') {
            if (popup1.hasClass('is-visible')) popup1.removeClass('is-visible');
            if (popup2.hasClass('is-visible')) popup2.removeClass('is-visible');
            if (popup3.hasClass('is-visible')) popup3.removeClass('is-visible');
        }
    });

    $("#menu").click(showMenuContent);
    $("#delete").click(function () {
        stop();
        $('#popup1').addClass('is-visible');
    });
    $("#plpa").click(playPause);
    $("#next").click(function () {
        stop();
        play();
    });
    $("#folder").click(function () {
        changeFolder();
        $('#popup2').addClass('is-visible');
    });
    $("#imgstyle").click(maximize);
    $("#movie").click(disableMove);

    $("#infod").click(function () {
        console.log('aaa');
        $('#popup3').addClass('is-visible');
    });

});