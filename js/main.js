const METHOD_INTERNET = '1';
const METHOD_YANDEX = '2';

let video;
let overlay;
let container;
let startLoop;

let buffer = [];


let current_method = localStorage.method;
if (current_method == undefined) {
    current_method = METHOD_INTERNET;
}

let mainSource = Source.getSource(current_method);
let prevSource = new PreviousSourceImpl();


function setMeta(html, src) {
    overlay.html(html);
    let ov_width = overlay.width();
    let sc_width = window.innerWidth;
    let position = (sc_width - ov_width) / 2;
    overlay.parent().css('left', position);
}

function playVideo(src, html = '') {
    if (video == undefined || src == undefined || src.trim() == '') return;
    clearTimeout(timer);
    setMeta(html);
    video.css({background: 'black'});
    video.off('ended');
    video.on('ended', function () {
        video.off('ended');
        startLoop();
    });
    video.data('prev-type', 'video');
    video.data('prev-src', src);
    video.attr('src', src);
    video.attr('autoplay', true);
    video.attr('controls', true);
    video[0].load();
}

function showImage(src, html = '') {
    console.log('showImage');
    if (video == undefined) return;
    setMeta(html, src);
    video.css({background: 'transparent url("' + src + '") 50% 50% / cover no-repeat'});
    video.off('ended');
    video[0].pause();
    video.attr('controls', false);
    video.attr('autoplay', false);
    video.data('prev-type', 'image');
    video.data('prev-src', src);
    video.attr('src', src);
    video.attr('poster', "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    video[0].load();
}

function toggleSettings() {
    let settings = $('#settings');
    let sbut = $('#sbut');

    if (settings.is(':hidden')) {
        settings.show();
        settings.animate({
            left: "+=105%"
        }, 1000, function () {
            sbut.html('&#10006;');
            sbut.css({opacity: 0.5});
        });
        let custom_pref = mainSource.getCustomPreferences();
        let div_custom_pref = $('#custom_prefs');
        div_custom_pref.html("");
        Object.keys(custom_pref).forEach(function (key) {
            let item = custom_pref[key];
            if (item.type == 'select') {
                let select = $('<select/>', {change: item.callback});
                item.items.forEach(function (subitem) {
                    Object.keys(subitem).forEach(function (option_key) {
                        $('<option/>', {text: subitem[option_key], value: option_key}).appendTo(select);
                    });
                });
                select.appendTo(div_custom_pref).before(`<label>${key}: </label>`).after('<br/>');
            } else if (item.type == 'button') {
                let button = $('<button/>', {click: item.callback, text: item.text});
                button.appendTo(div_custom_pref).before(`<label>${key}: </label>`).after('<br/>');
            }
        })
    } else {
        settings.animate({
            left: "-=105%"
        }, 1000, function () {
            settings.hide();
            sbut.html('&#9776;');
            sbut.css({opacity: 1});
        });
    }

}

function changeMethod(method) {
    if (localStorage.method != method) {
        localStorage.method = method;
    }
    current_method = method;
    mainSource = Source.getSource(current_method);
    startLoop();
}

function setPrevNextBindings() {
    $(document).click(function (event) {
        let scw = window.innerWidth;
        let clickX = event.offsetX;
        if (clickX < scw / 4) {
            startLoop(buffer.length > 1 ? buffer.pop() : undefined);
        }
        if (clickX > 3 * scw / 4) {
            startLoop();
        }
    });
}

$(function () {
    video = $("#video");
    overlay = $("#meta");
    container = $("#container");
    setMeta('← Выбрать источник');
    setPrevNextBindings();
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


    startLoop = function (srcObject) {
        clearTimeout(timer);
        if (!isPaused) {
            if (srcObject != undefined) {
                prevSource.show(srcObject);
            } else {
                buffer.push({src: video.data('prev-src'), html: overlay.html(), type: video.data('prev-type')});
                if (buffer.length >= 1000) {
                    buffer = buffer.slice(500, 999);
                }
                mainSource.show();
            }
        }
        timer = setTimeout(startLoop, interval);
    }

});