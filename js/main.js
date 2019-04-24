$(function () {
    function playVideo(src) {
        let video = $("#video");
        video.attr('src', src);
        video.attr('autoplay', true);
        video.attr('controls', true);
        video[0].load();
    }

    function setPoster(src) {
        let video = $("#video");
        video[0].pause();
        video.attr('autoplay', false);
        video.attr('controls', false);
        video.attr('src', src);
        video.attr('poster', src);
        video[0].load();

    }

    playVideo('//www.videvo.net/videvo_files/converted/2017_12/videos/171124_A1_HD_008.mp484461_jw.mp4');
    setTimeout(function () {
        setPoster('https://cdn.dribbble.com/users/66221/screenshots/1655593/html5.png');
        setTimeout(function () {
            playVideo('https://www.videvo.net/videvo_files/converted/2014_07/videos/Saint_Barthelemy.mov72328.mp4');

        }, 10000);
    }, 10000);


});