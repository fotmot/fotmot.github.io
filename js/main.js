const METHOD_YANDEX = 1;
let video;
let container;

function playVideo(src, time) {
    if (video == undefined || src == undefined || src.trim() == '') return;
    clearTimeout(timer);
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

function showImage(src, time) {
    if (video == undefined) return;
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
    container = $("#container");
    checkResources();
    //for starting
    video.on('ended', function () {
        video.off('ended');
        startLoop();
    });

    function checkResources() {
        checkYandex();
    }

    let isPaused = false;
    let interval = 30000;
    let current_method = METHOD_YANDEX;

    function startLoop() {
        clearTimeout(timer);
        if (!isPaused) {
            switch (current_method) {
                case METHOD_YANDEX: {
                    showYandex();

                    break;
                }
            }
        }
        timer = setTimeout(startLoop, interval);
    }

});