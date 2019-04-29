class PixelsSourceImpl extends Source {

    static pURL = 'https://api.pexels.com/';
    static solt = '5b63b49b2bad6f9170000bb1000001e0ebd2b44cee5943cb991356eabb6b2421b03d7';

    getDefaultSettings() {
        return {totalv: 1000, totalp: 1000, fotoVSvideo: 5};
    }

    show() {
        let rnd = PixelsSourceImpl.getRndInt(0, 10);
        if (rnd < this.settingsGetValue('fotoVSvideo')) {
            let settings_key = 'totalp';
            let url = 'v1/curated/?' + $.param({per_page: 1, page: random(1, this.settingsGetValue(settings_key), false)});
            this.sendRequest(settings_key, url, function (data) {
                showImage(data.photos[0].src.original, `Pixels.com, Author: <a href='${data.photos[0].photographer_url}'>${data.photos[0].photographer}</a>`);
            });
        } else {
            let settings_key = 'totalv';
            let url = 'videos/popular?' + $.param({per_page: 1, page: random(1, this.settingsGetValue(settings_key), false)});
            this.sendRequest(settings_key,url,function(data){
                playVideo(data.videos[0].video_files[0].link, `Pixels.com: <a href='${data.videos[0].url}'>video url</a>`);
            });
        }
    }

    sendRequest(settings_key, url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', PixelsSourceImpl.pURL + url);
        xhr.setRequestHeader('Authorization', PixelsSourceImpl.solt.replace(/b/g, ''));
        let self = this;
        xhr.onreadystatechange = function (data) {
            data = data.currentTarget;
            if (data.status == 200 && data.readyState == 4) {
                var data = JSON.parse(data.responseText);
                if (data.total_results != undefined && data.total_results !== self.settingsGetValue(settings_key)) {
                    self.settingsSetValue(settings_key, data.total_results);
                }
                callback(data);
            }
        };
        xhr.send();
    }

}