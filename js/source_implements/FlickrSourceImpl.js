class FlickrSourceImpl extends Source {

    getDefaultSettings() {
        return {total: 1, search: 'nature'};
    }

    getCustomPreferences() {
        let self = this;
        return {
            'Строка поиска': {
                type: 'input',
                attr: [
                    {key: 'id', value: 'flicker_search'},
                    {key: 'value', value: self.settingsGetValue('search')}
                ],
                callback: function () {
                    self.settingsSetValue('search', $('#flicker_search').val());
                }
            }
        }
    }

    show() {
        let self = this;
        let params = FlickrSourceImpl.DEFAULT_PARAMS;
        let total = self.settingsGetValue('total' + self.settingsGetValue('search'));
        if (total == undefined) {
            total = 1;
        }

        params.text = self.settingsGetValue('search');
        let pages = random(1, total, false);
        params.page = Math.floor(pages / FlickrSourceImpl.PRE_PAGE);
        let item = pages % (params.page * FlickrSourceImpl.PRE_PAGE);

        let url = FlickrSourceImpl.fURL + $.param(params);
        this.sendRequest(url, function (data) {
            if (data.photos.total != undefined && data.photos.total !== self.settingsGetValue('total' + self.settingsGetValue('search'))) {
                self.settingsSetValue('total' + self.settingsGetValue('search'), data.photos.total);
            }
            if(data.photos.photo[item]==undefined){
                self.show();
                return;
            }

            let fid = data.photos.photo[item].farm;
            let sid = data.photos.photo[item].server;
            let id = data.photos.photo[item].id;
            let osec = data.photos.photo[item].originalsecret;
            let sec = data.photos.photo[item].secret;
            let ofarm = data.photos.photo[item].originalformat;
            let uid = data.photos.photo[item].owner;
            let title = data.photos.photo[item].title;

            let autor = `https://www.flickr.com/photos/${uid}/${id}`;

            let img = `https://farm${fid}.staticflickr.com/${sid}/${id}_${sec}_b.jpg`;
            if (osec != undefined && ofarm != undefined) {
                img = `https://farm${fid}.staticflickr.com/${sid}/${id}_${osec}_o.${ofarm}`;
            }

            showImage(img, `Flickr.com: <a href='${autor}'>${title}</a>`);
        });
    }

    sendRequest(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        let self = this;
        xhr.onreadystatechange = function (data) {
            data = data.currentTarget;
            if (data.status == 200 && data.readyState == 4) {
                var data = JSON.parse(data.response);
                callback(data);
            }
        };
        xhr.send();
    }

}

FlickrSourceImpl.fURL = 'https://api.flickr.com/services/rest/?';
FlickrSourceImpl.PRE_PAGE = 100;
FlickrSourceImpl.DEFAULT_PARAMS = {
    api_key: '5076d59eeb5ee5a13ad5f2959626a7ce',
    format: 'json',
    method: 'flickr.photos.search',
    text: 'nature',
    extras: 'original_format',
    per_page: FlickrSourceImpl.PRE_PAGE,
    nojsoncallback: 1
};

FlickrSourceImpl.solt = '5076hd59eeb5ee5a13ahd5f2959626ah7ce'; //h