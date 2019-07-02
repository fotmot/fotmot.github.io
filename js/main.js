const METHOD_INTERNET = '1';
const METHOD_YANDEX = '2';
const METHOD_FLICKR = '3';

let video;
let overlay;
let container;
let startLoop;
let isPaused = false;
let cache;
let showedTime = 0;

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

function playVideo(src, html = '', additionalAction) {
    if (video == undefined || src == undefined || src.trim() == '') return;
    clearTimeout(timer);
    setMeta(html);
    video.css({background: 'black'});
    video.off('ended');
    video.on('ended', function () {
        video.off('ended');
        startLoop(undefined, true);
    });
    video.data('prev-type', 'video');
    video.data('prev-src', src);
    video.attr('autoplay', true);
    video.attr('controls', false);
    video.attr('src', src);
    video[0].load();
    video.data('loaded', true);
    if (additionalAction != undefined) {
        additionalAction(video[0]);
    }
    showedTime = (new Date()).getTime();
}

function showImage(src, html = '', c = true, callback) {
    if (video == undefined) return;
    video.off('ended');
    video[0].pause();
    if (c == true) {
        setMeta('<img src="/img/spinner.gif" width="14" height="14"> Loading ... ', src);
        cache.on("load", function () {
            cache.off('load');
            showImage(src, html, false, callback);
        });
        cache.attr('src', src);
        return;
    }
    setMeta(html, src);
    video.css({
        background: 'transparent url("' + src + '") 0% 0% / auto ' + window.innerHeight + 'px transparent;',
    });

    video.attr('autoplay', false);
    video.attr('controls', false);
    video.data('prev-type', 'image');
    video.data('prev-src', src);
    video.attr('src', '');
    video.attr('poster', "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    video.data('loaded', true);
    showedTime = (new Date()).getTime();
    if (callback != undefined) {
        callback();
    }
}

function showSettings() {
    let custom_pref = mainSource.getCustomPreferences();
    let div_custom_pref = $('#custom_prefs');
    div_custom_pref.html("");
    Object.keys(custom_pref).forEach(function (key) {
        let item = custom_pref[key];
        let div = $('<div/>', {class: 'field'});
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
                drawItem(div, i, div_custom_pref, before, after);
            })
        } else {
            drawItem(div, item, div_custom_pref, `<label>${key}: </label>`, '<br/>');
        }
        div.appendTo(div_custom_pref);
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
            $('body').on('click', function (event) {
                if ($(event.target).attr('id') == 'video' || $(event.target).attr('id') == 'meta') {
                    $('body').off('click');
                    toggleSettings();
                }
            });
        });

        showSettings();
    } else {
        $('body').off('click');
        settings.animate({
            left: "-=105%"
        }, 1000, function () {
            settings.hide();
            sbut.html('&#9776;');
            sbut.css({opacity: 1});

        });
    }

}

function drawItem(div, item, div_custom_pref, before, after) {
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
    } else if (item.type == 'range') {
        control = $('<input/>', {type: 'range', change: item.callback});
    } else if (item.type == 'input') {
        control = $('<input/>', {type: 'text', change: item.callback});
    } else if (item.type == 'checkbox') {
        control = $('<input/>', {type: 'checkbox', change: item.callback});
    }

    control.appendTo(div).before(before).after(after);
    if (item.attr !== undefined) {
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
            startLoop(buffer.length > 1 ? buffer.pop() : undefined, true);
        }
        if (clickX > 4 * scw / 5) {
            startLoop(undefined, true);
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


    startLoop = function (srcObject, forceNext = false) {
        clearTimeout(timer);
        let curTime = (new Date()).getTime();
        let porog = (showedTime + interval) - 3000;
        let timeout = interval;
        if (!isPaused && video.data('loaded') == true && ((porog < curTime) || forceNext)) {
            video.data('loaded', 'false');
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
        } else if (isPaused) {
            console.log('Skip due to isPaused = true');
        } else if (video.data('loaded') != true) {
            console.log('Skip due to image not yet loaded');
        } else if (porog >= curTime) {
            console.log('Skip due to image not yet shown enough, need more seconds: ', (porog - curTime) / 1000);
            timeout = porog - curTime + 1;
        }

        timer = setTimeout(startLoop, timeout);
    }

});
