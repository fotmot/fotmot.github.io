/* 
 * Kazakov Ivan
 * mail@x-noname.ru
 */

var isPaused = false;
var isDebug = false;
var folder;
var total;
var timerId;
var trash = [];
let videoAutoRun = false;

var imgExpand = "img/expand.png";
var imgShrink = "img/shrink.png";
var imgWait = "img/wait.png";
var imgFolder = "img/folder.png";
var imgTrash = "img/trashcan.png";
var imgPrev = "img/prev.png";
var imgNext = "img/next.png";
var imgParams = "img/params.png";
var imgPause = "img/pause.png";
var imgPlay = "img/play.png";
var photoFolder;

var imgstyle = 'contain';

var isPlayMove = true;

document.onkeyup = function (ev) {
    if (ev.which == 13 || ev.keyCode == 13 || ev.which == 457 || ev.keyCode == 457) {
        //code to execute here
        performClick();
        return false;
    }
}


function hideMenu() {
    $("#menu").hide();
}

function showMenu() {
    $("#menu").show();
}

function showMenuContent() {
    $("#menuitems").toggle();
    $('.params').toggleClass('opened');
}

function hideMenuContent() {
    $("#menuitems").hide();
}

function togleElements() {
    // $("#folders").toggle();
    // $(".folder").toggleClass('opened');
}

function changeFolder() {
    togleElements();

    var sel = $("#selectfolders");

    sel.html('<option value="-1">Выбрать папку</option>');
    $("<option/>", {value: photoFolder, text: 'Папка автозагрузки фотографий'}).appendTo(sel);

    q('GET', "/disk/resources", {
        path: "/",
        fields: '_embedded.items.name,_embedded.items.path,_embedded.items.type'
    })
        .done(function (data) {
            data._embedded.items.forEach(function (item) {
                if (item.type === "dir") {
                    $("<option/>", {value: item.path, text: item.name}).appendTo(sel);
                }
            });
        });

}

function maximize() {
    if (imgstyle === "contain") {
        imgstyle = "cover";
        $(".expand").attr('src', imgShrink);
        setSettings('crop', true);
    } else {
        imgstyle = "contain";
        $(".expand").attr('src', imgExpand);
        setSettings('crop', false);
    }
    $("div.img").css("background-size", imgstyle);
}

function setFolder(fld) {

    togleElements();
    if (fld == "-1") return;

    q('GET', "/disk/resources", {
        path: fld,
        fields: '_embedded.total'
    })
        .done(function (data) {

            total = data._embedded.total;
            folder = fld;
            setSettings('folder', folder);
            trash = [];
            stop();
            play();
        });

}

function performClick() {
    console.log('double click');
    if (!document.webkitIsFullScreen) {
        window.document.body.webkitRequestFullscreen();
    } else {
        window.document.webkitCancelFullScreen();
    }
}

function del() {
    var currentPath = $('#content').data('path');
    q('DELETE', '/disk/resources', {path: currentPath})
        .done(play);
}

function confirm2() {
    stop();
    //$('#confirm>img').attr('src',$('#content').data('preview'));
    $('#confirm').show();
}

function playPause() {
    if (isPaused) {
        play();
    } else {
        stop();
    }
}

function play() {
    clearTimeout(timerId);
    $(".stop").attr("src", imgPause);
    isPaused = false;
    timerId = setTimeout(showRandom, 10);
}

function stop() {
    isPaused = true;
    clearTimeout(timerId);
    $(".stop").attr("src", imgPlay);
}

function go() {
    getFolders();
}

var settings;

function loadSettings() {
    var set = localStorage['settings'];
    if (typeof (set) === "undefined") {
        set = "{\"folder\":false,\"crop\":false,\"motion\":false}";
    }
    settings = JSON.parse(set);
}

function saveSettings() {
    localStorage['settings'] = JSON.stringify(settings);
}

function getSettings(key) {
    if (typeof (set) === "undefined") {
        loadSettings();
    }
    return settings[key];
}

function setSettings(key, value) {
    if (typeof (set) === "undefined") {
        loadSettings();
    }
    settings[key] = value;
    saveSettings();
}

var usedPos = [];


function showRandom() {
    if (isPaused) return;
    var pos = Math.floor(Math.random() * total);
    var attempt = 0;
    while (usedPos.indexOf(pos) >= 0 && attempt++ < 100) {
        pos = Math.floor(Math.random() * total + 1);
    }
    usedPos.push(pos);
    q('GET', '/disk/resources', {
        path: folder,
        limit: 1,
        offset: pos,
        fields: '_embedded.items.exif,_embedded.items.preview,_embedded.items.size,_embedded.items.media_type,_embedded.items.file,_embedded.items.name,_embedded.items.path'
    })
        .done(function (data) {

            if (data._embedded.items.length === 0) {
                alert("В указанной папке нет файлов");
                $("#folder").click();
                return;
            }

            if (isDebug) console.log(data._embedded.items);

            if (data._embedded.items[0] && (data._embedded.items[0].media_type === 'image'
                || data._embedded.items[0].media_type === 'video')) {
                var name = data._embedded.items[0].name;
                var file = data._embedded.items[0].file;
                var path = data._embedded.items[0].path;
                var size = data._embedded.items[0].size;
                var date_time = data._embedded.items[0].exif.date_time;
                var preview = data._embedded.items[0].preview;
                $("#delprev").attr('src', preview);

                var media_type = data._embedded.items[0].media_type;
                var content = $("#content");

                content.data('path', path);
                content.data('preview', preview);

                //              if(media_type==="image")cache.attr('src',file);
                if (date_time) {
                    var d = new Date(date_time);
                    date_time = d.toLocaleDateString();
                }
                if (media_type === "video" || media_type === "image") {
                    let needStop = showPhotoOrVideo({
                        name: name,
                        path: path,
                        file: file,
                        media_type: media_type,
                        size: size,
                        preview: preview,
                        date_time: date_time
                    }, content);
                    if (!isPaused && !needStop) {
                        timerId = setTimeout(showRandom, 30000);
                    }
                } else {
                    showRandom();
                }
            } else {
                console.log('Посторонние файлы в каталоге');
                trash[data._embedded.items[0].name] = 1;
                if (!isPaused) {
                    clearTimeout(timerId);
                    timerId = setTimeout(showRandom, 1000);
                }
            }
        });
}

function getFiles() {
    q('GET', '/disk/resources', {path: folder, fields: '_embedded.total'})
        .done(function (data) {
            total = data._embedded.total;
            if (total === 0 || total == trash.length) {
                alert("В указанной папке нет файлов");
                $("#folder").click();
                return;
            }
            showRandom();
        })
        .fail(function () {
            alert("Неизвестная ошибка, выберете другую папку");
            $("#folder").click();
            return;
        })
    ;
}

function getFolders() {
    q('GET', '/disk/', {})
        .done(function (data) {
            if (data.system_folders.photostream) {
                if (getSettings('folder')) {
                    folder = getSettings('folder');
                    trash = [];
                } else {
                    folder = data.system_folders.photostream;
                    setSettings('folder', folder);
                    trash = [];
                }
                photoFolder = data.system_folders.photostream;
                getFiles();
            } else {
                console.err('Can\'t find data.system_folders.photostream');
            }
        });
}

function updateContainer(content, newNode) {
    content.fadeOut(1000, function () {
        content.html('');
        newNode.appendTo(content);
        content.fadeIn(2000);
    });
}


function showPhotoOrVideo(mediaObject, content) {
    if (isDebug) console.log(mediaObject.media_type, mediaObject.size, isPlayMove);
    if (mediaObject.media_type === "image" && mediaObject.size > 1.5 * 1024 * 1024 && isPlayMove) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 25000;
        xhr.open('GET', mediaObject.file, true);
        xhr.responseType = 'arraybuffer';
        xhr.ontimeout = function (e) {
            if (isDebug) console.log("TimeOut reached");
        };
        xhr.onload = function (e) {
            if (this.status === 206 || this.status === 200) {
                var byteArray = new Uint8Array(this.response);
                var index = findIndex(byteArray);
                if (isDebug) console.log('index=', index);
                if (index >= 0) {
                    var videoArray = byteArray.slice(index);
                    var blobVideo = new Blob([videoArray], {type: 'video/h264'});
                    var video = $("<video/>", {title: mediaObject.name}); //loop:true
                    video.trigger('load', function (e) {
                        window.URL.revokeObjectURL(video[0].src); // Clean up after yourself.
                    });
                    video[0].src = window.URL.createObjectURL(blobVideo);
                    if (mediaObject.date_time) {
                        $("<div/>", {
                            class: 'date',
                            text: mediaObject.date_time,
                            controls: videoAutoRun ? false : 'controls'
                        }).appendTo(video);

                    }
                    updateContainer(content, video);
                    video[0].loop = true;
                    video[0].defaultPlaybackRate = 0.4;
                    video[0].playbackRate = 0.4;

                    video[0].addEventListener('error', function (evt) {
                        //показываем хотя бы картинку
                        var img = $("<div/>", {
                            class: 'img',
                            title: mediaObject.name,
                            style: 'background-size:' + imgstyle + ';background-image:url(' + mediaObject.file + ')'
                        });
                        if (mediaObject.date_time) {
                            $("<div/>", {class: 'date', text: mediaObject.date_time}).appendTo(img);
                        }
                        updateContainer(content, img);
                    }, false);

                    video[0].addEventListener('progress', function (evt) {
                        if (videoAutoRun) {
                            video[0].play();
                        }
                    }, false);


                } else {
                    var img = $("<div/>", {
                        class: 'img',
                        title: mediaObject.name,
                        style: 'background-size:' + imgstyle + ';background-image:url(' + mediaObject.file + ')'
                    });
                    if (mediaObject.date_time) {
                        $("<div/>", {class: 'date', text: mediaObject.date_time}).appendTo(img);
                    }
                    updateContainer(content, img);
                }
            } else {
                console.error(this.status, this.statusText, this.responseText);
            }
        };
        xhr.send();
    } else if (mediaObject.media_type === "image") {
        var img = $("<div/>", {
            class: 'img',
            title: mediaObject.name,
            style: 'background-size:' + imgstyle + ';background-image:url(' + mediaObject.file + ')'
        });
        if (mediaObject.date_time) {
            $("<div/>", {class: 'date', text: mediaObject.date_time}).appendTo(img);
        }
        updateContainer(content, img);
    } else {
        clearTimeout(timerId);
        var vid = $("<video/>", {
            src: mediaObject.file,
            title: mediaObject.name,
            autoplay: videoAutoRun ? true : false,
            play: function(){
                $(this).data('played','true');
            },
            ended: function () {
                if (!isPaused) {
                    if($(this).data('played')=='true'){
                        showRandom();
                    }else {
                        $(this).attr('controls','controls');
                        this.play();
                    }
                }
            }
        });
        if (mediaObject.date_time) {
            $("<div/>", {class: 'date', text: mediaObject.date_time}).appendTo(vid);
        }
        updateContainer(content, vid);
        return videoAutoRun;
    }
}

function findIndex(arr) {
    var search = [116, 111, 95, 68, 97, 116, 97];
    var index = 0;
    top:
        while (index < arr.length) {
            var prevGood = arr.indexOf(97, index);
            if (prevGood < 0) return -1;
            for (var i = 1; i <= 5; i++) {
                if (arr[prevGood - i] !== search[6 - i]) {
                    index = prevGood + 1;
                    continue top;
                }
            }
            return prevGood + 1;
        }
    return -1;
}

function disableMove() {

    var movie = $('#movie>img');
    movie.toggleClass('disabled');
    isPlayMove = !isPlayMove;
    if (movie.attr('class').indexOf('disabled') >= 0) {
        movie.attr('src', 'img/dyn.png');
        setSettings('motion', true);
    } else {
        movie.attr('src', 'img/stat.png');
        setSettings('motion', false);
    }
}