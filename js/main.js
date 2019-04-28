const METHOD_INTERNET = '1';
const METHOD_YANDEX = '2';

let video;
let overlay;
let container;
let startLoop;

let current_method = localStorage.method;
if(current_method == undefined){
    current_method = METHOD_INTERNET;
}

function playVideo(src, html = '') {
    if (video == undefined || src == undefined || src.trim() == '') return;
    clearTimeout(timer);
    overlay.html(html);
    video.css({background: 'black'});

    video.off('ended');
    video.on('ended', function () {
        video.off('ended');
        startLoop();
    });
    video.attr('src', src);
    video.attr('autoplay', true);
    video.attr('controls', true);
    video[0].load();
}

function showImage(src, html = '') {
    if (video == undefined) return;
    overlay.html(html);
    video.css({background: 'transparent url("'+src+'") 50% 50% / cover no-repeat'});

    video.off('ended');
    video[0].pause();
    video.attr('controls', false);
    video.attr('autoplay', false);
    video.attr('src', src);
    video.attr('poster', "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    video[0].load();
}

function toggleSettings(){
    let settings = $('#settings');
    let sbut = $('#sbut');

    if(settings.is(':hidden')){
        settings.show();
        settings.animate({
            left: "+=105%"
        }, 1000, function() {
            sbut.html('&#10006;');
            sbut.css({opacity:0.5});
        });
    }else{
        settings.animate({
            left: "-=105%"
        }, 1000, function() {
            settings.hide();
            sbut.html('&#9776;');
            sbut.css({opacity:1});
        });
    }

}

function changeMethod(method){
    if(localStorage.method!=method){
        localStorage.method = method;
    }
    current_method =method;
    startLoop();
}

$(function () {
    video = $("#video");
    overlay = $("#meta");
    container = $("#container");
    $(document).dblclick(function () {
        if (!document.webkitIsFullScreen) {
            window.document.body.webkitRequestFullscreen();
        } else {
            window.document.webkitCancelFullScreen();
        }
    });

    $('#sel_method').val(current_method);
    //for starting
    video.on('ended', function () {
        video.off('ended');
        startLoop();
    });


    let isPaused = false;
    let interval = 30000;


    startLoop = function () {
        clearTimeout(timer);
        if (!isPaused) {
            switch (current_method) {
                case METHOD_YANDEX: {
                    checkYandex();
                    showYandex();
                    break;
                }
                case METHOD_INTERNET: {
                    showPixel();
                    break;
                }
            }
        }
        timer = setTimeout(startLoop, interval);
    }

});