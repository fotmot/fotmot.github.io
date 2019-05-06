const METHOD_INTERNET = '1';
const METHOD_YANDEX = '2';

let video;
let overlay;
let container;
let startLoop;
let isPaused = false;
let cache;

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
    video.attr('autoplay', true);
    video.attr('controls', false);
    video.attr('src', src);
    video[0].load();
}

function showImage(src, html = '', c = true) {
    console.log('showImage', c);
    if (video == undefined) return;
    video.off('ended');
    video[0].pause();
    if (c == true) {
        setMeta('<img src="/img/spinner.gif" width="14" height="14"> Loading ... ', src);
        cache.on("load", function () {
            cache.off('load');
            showImage(src, html, false);
        });
        cache.attr('src', src);
        return;
    }
    setMeta(html, src);
    video.css({
        background: 'transparent url("' + src + '")',
        backfaceVisibility: 'transparent',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'auto ' + window.innerHeight + 'px'
    });
    video.attr('autoplay', false);
    video.attr('controls', false);
    video.data('prev-type', 'image');
    video.data('prev-src', src);
    video.attr('src', '');
    video.attr('poster', "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
}

function showSettings() {
    let custom_pref = mainSource.getCustomPreferences();
    let div_custom_pref = $('#custom_prefs');
    div_custom_pref.html("");
    Object.keys(custom_pref).forEach(function (key) {
        let item = custom_pref[key];
        if (item.type == 'multi') {
            item.controls.forEach(function (i, index) {
                let before = '';
                let after = '';
                if (index == 0) {
                    before = `<label>${key}: </label>`;
                }
                if (index == item.controls.length - 1) {
                    after = '<br/>';
                }
                drawItem(i, div_custom_pref, before, after);
            })
        } else {
            drawItem(item, div_custom_pref, `<label>${key}: </label>`, '<br/>');
        }
    });
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
        showSettings();
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

function drawItem(item, div_custom_pref, before, after) {
    let control = undefined;
    if (item.type == 'select') {
        control = $('<select/>', {change: item.callback});
        item.items.forEach(function (subitem) {
            Object.keys(subitem).forEach(function (option_key) {
                if (option_key != 'selected') {
                    if (subitem.selected != undefined) {
                        $('<option/>', {
                            text: subitem[option_key],
                            value: option_key,
                            selected: 'selected'
                        }).appendTo(control);
                    } else {
                        $('<option/>', {text: subitem[option_key], value: option_key}).appendTo(control);

                    }
                }

            });
        });
    } else if (item.type == 'button') {
        control = $('<button/>', {click: item.callback, text: item.text});
    } else if (item.type == 'text') {
        control = $('<span/>', {text: item.text});
    } else if (item.type == 'image') {
        control = $('<img/>', {src: item.src, click: item.callback});
    }
    control.appendTo(div_custom_pref).before(before).after(after);
    if (item.attr !== undefined) {
        console.log(item.attr);
        item.attr.forEach(function (attr) {
            control.attr(attr.key, attr.value);
        });
    }
}

function changeMethod(method) {
    if (localStorage.method != method) {
        localStorage.method = method;
    }
    current_method = method;
    mainSource = Source.getSource(current_method);
    showSettings();
}

function setPrevNextBindings() {
    video.click(function (event) {
        let scw = window.innerWidth;
        let clickX = event.offsetX;
        if (clickX < 1 * scw / 5) {
            startLoop(buffer.length > 1 ? buffer.pop() : undefined);
        }
        if (clickX > 4 * scw / 5) {
            startLoop();
        }
        event.preventDefault();
    });
}

$(function () {
    video = $("#video");
    overlay = $("#meta");
    container = $("#container");
    cache = $("#cache");
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
                if (!isPaused) {
                    mainSource.show();
                }
            }
        }
        timer = setTimeout(startLoop, interval);
    }

});
