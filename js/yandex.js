const URL = 'https://cloud-api.yandex.net:443/v1';
const YAD_METHOD_RANDOM = 1;
const YAD_METHOD_LAST = 2;
const YAD_AUTOLOAD_FOLDER = 'photostream';


let yad = Cookies.get('yad');
let yad_settings = localStorage['yad_settings'];
if (yad_settings == undefined) {
    yad_settings = JSON.stringify({
        method: YAD_METHOD_RANDOM,
        folder: YAD_AUTOLOAD_FOLDER,
        total: {},
        total_created: (new Date()).getTime()
    });
    localStorage['yad_settings'] = yad_settings;
}
yad_settings = JSON.parse(yad_settings);
if (yad_settings.total_created + 86400000 < (new Date()).getTime()) {
    //сбрасываем кеш
    yad_settings.total = {};
    yad_settings.total_created = (new Date()).getTime();
    localStorage.yad_settings = JSON.stringify(yad_settings);
}

function setHeader(xhr) {
    xhr.setRequestHeader('Authorization', 'OAuth ' + yad);
}

function handleError(jqXHR, resp) {
    if (jqXHR.status === 403 || jqXHR.status === 401) {
        //window.location = 'autorize.html'; // redirect page
        console.error("Authorization error: ", jqXHR);
    } else if (jqXHR.status === 404) {
        console.error("Unknown error: ", jqXHR);
    } else {
        console.error("Unknown error: ", jqXHR);
    }
}

function checkYandex() {
    if (yad == undefined) {
        autorize();
    } else {
        getDisk({fields: 'user'}, function () {
            console.log('Autorization is fine');
            return;
        }, function (jqXHR, resp) {
            if (jqXHR.status == 401 || jqXHR.status == 401) {
                autorize();
            } else {
                console.log(jqXHR)
            }
        });
    }
}

function autorize() {
    window.location = "https://oauth.yandex.ru/authorize?response_type=token&client_id=0a6b37f8cb8c409a9f93727566ceac76&force_confirm=yes&state=12";
}

function getDisk(params, good, bad) {
    q('GET', URL + '/disk', params, bad).done(good);
}

function getResources(params, good, bad) {
    q('GET', URL + '/disk/resources', params, bad).done(good);
}

function q(type, url, params, bad) {
    return $.ajax({
        url: url,
        type: type,
        data: params,
        contentType: 'application/json',
        dataType: "json",
        error: bad,
        beforeSend: setHeader
    });
}

function showYandex() {
    if (yad_settings.method == YAD_METHOD_RANDOM) {
        if (yad_settings.folder == YAD_AUTOLOAD_FOLDER) { //узнаем настоящее имя папки
            getDisk('system_folders.photostream', function (response) {
                console.log('Folder is:', response.system_folders.photostream);
                yad_settings.folder = response.system_folders.photostream;
                localStorage.yad_settings = JSON.stringify(yad_settings);
            }, function (jqXHR, resp) {
                if (jqXHR.status == 401 || jqXHR.status == 401) {
                    autorize();
                } else {
                    chooseFolder();
                }
            })
        } else {
            //check folder exist
            console.log(localStorage);
            loadFolder();
        }
    }
}

function loadFolder(folder = yad_settings.folder) {
    if (yad_settings['total'][folder] == undefined) {
        console.log('LOAF FOLDER: ', folder);
        getResources({path: folder}, function (response) {
            let total = response['_embedded']['total'];
            if (total < 1 && folder != yad_settings.folder) {
                return false; //need chose another folder
            } else if (total < 1) {
                chooseFolder();
            } else {
                yad_settings['total'][folder] = total;
                localStorage.yad_settings = JSON.stringify(yad_settings);
                loadResource(folder);
            }
        }, function () {
            if (jqXHR.status == 401 || jqXHR.status == 401) {
                autorize();
            } else {
                chooseFolder();
            }
        })
    } else {
        loadResource(folder);
    }
}

function loadResource(folder) {
    let offset = random(0, yad_settings.total[folder]);
    getResources({path: folder, limit: 1, offset: offset}, function (response) {
            let item = response._embedded.items[0];
            if (item.type == 'file') {
                if (item.media_type == 'image') {
                    showImage(item.file, item.exif.date_time);
                } else if (item.media_type == 'video') {
                    playVideo(item.file, item.exif.date_time);
                } else {
                    console.log('Not image and video', item);
                    loadResource();
                }
            } else if (item.type == 'dir') {
                loadFolder(item.path)
            }
        }
        , handleError);
}

function chooseFolder() {
    console.log('Let choose folder');
    //clear rnd collector
    rnd = [];
}