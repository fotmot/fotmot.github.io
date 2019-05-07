class GooglePhotoSourceImpl extends Source {
    static cid = '222308987197-jtfseia6er4a7kjdoced5vkjnsb047bb.apps.googleusercontent.com';
    static api_key = 'AIzaSyBuAu62CiLDDDNwWFN72YRVoS7Qt8eQ01E';
    static SCOPE = 'https://www.googleapis.com/auth/photoslibrary.readonly';

    constructor() {
        super();
        let self = this;
        this.items = [];

        gapi.load('client:auth2', function () {
            gapi.client.init({
                'apiKey': GooglePhotoSourceImpl.api_key,
                'clientId': GooglePhotoSourceImpl.cid,
                'scope': GooglePhotoSourceImpl.SCOPE,
                'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            }).then(function () {
                self.GoogleAuth = gapi.auth2.getAuthInstance();
                // Listen for sign-in state changes.
                self.GoogleAuth.isSignedIn.listen(function (data) {
                    if (data) {
                        self.getPhotos();
                    } else {
                        console.log('Not autorized');
                    }
                });
                var user = self.GoogleAuth.currentUser.get();
                var isAuthorized = user.hasGrantedScopes(GooglePhotoSourceImpl.SCOPE);
                if (isAuthorized) {
                    self.getPhotos('');
                } else {
                    self.GoogleAuth.signIn();
                }
            });
        });
    }

    getDefaultSettings() {
        return {total: 1};
    }

    getCustomPreferences() {
        return {};
    }

    show() {
        let rnd = random(0, this.settingsGetValue('total') - 1, false);
        if (this.items[rnd] != undefined) {
            let item = this.items[rnd];
            if (item.mimeType.includes('image')) {
                showImage(item.baseUrl, item.filename + `(${item.mediaMetadata.creationTime})`);
            } else if (item.mimeType.includes('video')) {
                playVideo(item.baseUrl, item.filename + `(${item.mediaMetadata.creationTime})`);
            } else {
                console.log('Not image and video: ', item);
                this.show();//если не видео и не картинка, то пытаемся со следующим рандомом
            }
        } else {
            console.log('There is no item with index ', rnd, this.items);
        }
    }

    getPhotos(pageToken = '') {
        let self = this;
        gapi.client.request({
            'path': 'https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=100&pageToken=' + pageToken,
            'method': 'GET'
        }).then(function (response) {
            response.result.mediaItems.forEach(function (file) {
                self.items.push(file);
            });
            if (response.result.mediaItems.length == 100) {
                self.getPhotos(response.result.nextPageToken);
            } else {
                self.settingsSetValue('total', self.items.length);
                self.last_item_shown = 0;
            }
        }, function (reason) {
            console.log(reason);
        });
    }

}