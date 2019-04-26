let pURL = 'https://api.pexels.com/';
let solt = '5b63b49b2bad6f9170000bb1000001e0ebd2b44cee5943cb991356eabb6b2421b03d7';

let pixel_settings = localStorage['pixels'];
if (pixel_settings == undefined) {
    pixel_settings = JSON.stringify({totalv: 1000, totalp: 1000});
    localStorage['pixels'] = pixel_settings;
}
pixel_settings = JSON.parse(pixel_settings);

let trigger = false;

function showPixel() {

    if (trigger) {
        trigger = false;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', pURL + 'videos/popular?' + $.param({
            per_page: 1,
            page: random(1, pixel_settings.totalv, false)
        }));
        xhr.setRequestHeader('Authorization', solt.replace(/b/g, ''));
        xhr.onreadystatechange = function () {
            if (this.status == 200 && this.readyState == 4) {
                var data = JSON.parse(this.responseText);
                if (data.total_results !== pixel_settings.totalv) {
                    pixel_settings.totalv = data.total_results;
                    localStorage['pixels'] = JSON.stringify(pixel_settings);
                }
                playVideo(data.videos[0].video_files[0].link, `Pixels.com: <a href='${data.videos[0].url}'>video url</a>`);
            }
        };
        xhr.send();
    } else {
        trigger = true;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', pURL + 'v1/curated/?' + $.param({per_page: 1, page: random(1, pixel_settings.totalp, false)}));
        xhr.setRequestHeader('Authorization', solt.replace(/b/g, ''));
        xhr.onreadystatechange = function () {
            if (this.status == 200 && this.readyState == 4) {
                var data = JSON.parse(this.responseText);
                if (data.total_results != undefined && data.total_results !== pixel_settings.totalp) {
                    pixel_settings.totalp = data.total_results;
                    localStorage['pixels'] = JSON.stringify(pixel_settings);
                }
                showImage(data.photos[0].src.original, `Pixels.com, Author: <a href='${data.photos[0].photographer_url}'>${data.photos[0].photographer}</a>`);
            }
        };
        xhr.send();
    }

}

