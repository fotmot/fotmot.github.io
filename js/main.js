$(function () {
    let video = $("#video");
    let container = $("#container");

    function playVideo(src) {
        video.attr('src', src);
        video.attr('autoplay', true);
        video.attr('controls', true);
        video[0].load();
    }

    function showImage(src) {
        video[0].pause();
        video.attr('controls', false);
        video.attr('autoplay', false);
        video.attr('src', src);
        video.attr('poster', src);
        video[0].load();
    }

    checkResources();

    //for starting
    video.on('ended', function () {
        video.off('ended');
        startLoop();
    });

    function checkResources() {
        checkYandex();
    }

    function startLoop() {
        playVideo('//www.videvo.net/videvo_files/converted/2017_12/videos/171124_A1_HD_008.mp484461_jw.mp4');
        setTimeout(function () {
            showImage('https://cdn.dribbble.com/users/66221/screenshots/1655593/html5.png');
            setTimeout(function () {
                playVideo('https://www.videvo.net/videvo_files/converted/2014_07/videos/Saint_Barthelemy.mov72328.mp4');

            }, 10000);
        }, 10000);
    }

});