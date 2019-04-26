const METHOD_YANDEX = 1;
const METHOD_INTERNET = 2;
let video;
let overlay;
let container;
let startLoop;

function playVideo(src, html = '') {
    if (video == undefined || src == undefined || src.trim() == '') return;
    clearTimeout(timer);
    overlay.html(html);
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
    video.off('ended');
    video[0].pause();
    video.attr('controls', false);
    video.attr('autoplay', false);
    video.attr('src', src);
    video.attr('poster', src);
    video[0].load();
}

$(function () {
    video = $("#video");
    overlay = $("#overlay");
    container = $("#container");
    //for starting
    video.on('ended', function () {
        video.off('ended');
        startLoop();
    });


    let isPaused = false;
    let interval = 30000;
    let current_method = METHOD_INTERNET;

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