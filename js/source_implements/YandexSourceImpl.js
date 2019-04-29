class YandexSourceImpl extends Source {

    static URL = 'https://cloud-api.yandex.net:443/v1';
    static YAD_METHOD_RANDOM = 1;
    static YAD_METHOD_LAST = 2;
    static YAD_AUTOLOAD_FOLDER = 'photostream';

    constructor(){
        super();
        this.yad = Cookies.get('yad');
        this.checkCache();
        this.checkAuth();
    }

    getDefaultSettings() {
        return {method: 1, folder: 'photostream', total: {}, total_created:(new Date()).getTime()};
    }

    show() {
        let self = this;
        if (this.settingsGetValue('method') == this.YAD_METHOD_RANDOM) {
            if (this.settingsGetValue('folder') == this.YAD_AUTOLOAD_FOLDER) { //узнаем настоящее имя папки
                this.getDisk('system_folders.photostream', function (response) {
                    console.log('Folder is:', response.system_folders.photostream);
                    self.settingsSetValue('folder',response.system_folders.photostream);
                    self.loadFolder();
                }, function (jqXHR, resp) {
                    if (jqXHR.status == 401 || jqXHR.status == 401) {
                        self.autorize();
                    } else {
                        self.chooseFolder();
                    }
                })
            } else {
                //check folder exist
                console.log(localStorage);
                this.loadFolder();
            }
        }
    }

    loadFolder(folder) {
        if(folder==undefined){
            folder = this.settingsGetValue('folder');
        }
        let totalSettings = this.settingsGetValue('total');
        if (totalSettings[folder] == undefined) {
            let self = this;
            this.getResources({path: folder}, function (response) {
                let total = response['_embedded']['total'];
                if (total < 1 && folder != self.settingsGetValue('folder')) {
                    console.log('Не помню для чего это тут');
                    return false; //need chose another folder
                } else if (total < 1) {
                    self.chooseFolder();
                } else {
                    totalSettings['folder']=total;
                    self.settingsSaveValue('total',totalSettings);
                    self.loadResource(folder);
                }
            }, function () {
                if (jqXHR.status == 401 || jqXHR.status == 401) {
                    self.autorize();
                } else {
                    self.chooseFolder();
                }
            })
        } else {
            this.loadResource(folder);
        }
    }

    loadResource(folder) {
        let offset = random(0, this.settingsGetValue('total')[folder]);
        let self = this;
        this.getResources({path: folder, limit: 1, offset: offset}, function (response) {
                let item = response._embedded.items[0];
                if (item.type == 'file') {
                    if (item.media_type == 'image') {
                        showImage(item.file, item.exif.date_time);
                    } else if (item.media_type == 'video') {
                        playVideo(item.file, item.exif.date_time);
                    } else {
                        console.log('Not image and video', item);
                        self.loadResource(folder);
                    }
                } else if (item.type == 'dir') {
                    self.loadFolder(item.path)
                }
            }
            , self.handleError);
    }

    setHeader(xhr) {
        xhr.setRequestHeader('Authorization', 'OAuth ' + this.yad);
    }

    handleError(jqXHR, resp) {
        if (jqXHR.status === 403 || jqXHR.status === 401) {
            //window.location = 'autorize.html'; // redirect page
            console.error("Authorization error: ", jqXHR);
        } else if (jqXHR.status === 404) {
            console.error("Unknown error: ", jqXHR);
        } else {
            console.error("Unknown error: ", jqXHR);
        }
    }

    checkCache() {
        if (this.settingsGetValue('total_created') + 86400000 < (new Date()).getTime()) {
            //сбрасываем кеш
            this.settingsSetValue('total',{});
            this.settingsSetValue('total_created',(new Date()).getTime());
        }
    }

    checkAuth() {
        if (this.yad == undefined) {
            this.autorize();
        } else {
            let self = this;
            this.getDisk({fields: 'user'}, function () {
                console.log('Autorization is fine');
                return;
            }, function (jqXHR, resp) {
                if (jqXHR.status == 401 || jqXHR.status == 401) {
                    self.autorize();
                } else {
                    console.log(jqXHR)
                }
            });
        }
    }

    autorize() {
        window.location = "https://oauth.yandex.ru/authorize?response_type=token&client_id=0a6b37f8cb8c409a9f93727566ceac76&force_confirm=yes&state=12";
    }

    getDisk(params, success, fail) {
        this.q('GET', URL + '/disk', params, fail).done(success);
    }

    getResources(params, success, fail) {
        q('GET', URL + '/disk/resources', params, fail).done(success);
    }

    q(type, url, params, bad) {

        return $.ajax({
            url: url,
            type: type,
            data: params,
            contentType: 'application/json',
            dataType: "json",
            error: bad,
            beforeSend: this.setHeader
        });
    }

    chooseFolder() {
        console.log('Let choose folder');
    }
}