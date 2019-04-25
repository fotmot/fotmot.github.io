const URL = 'https://cloud-api.yandex.net:443/v1';

let yad = Cookies.get('yad');

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
    if (false && yad == undefined) {
        autorize();
    } else {
        getDisk({fields: 'user'}, function () {
            console.log('Autorization is fine');
            return;
        }, function (jqXHR, resp) {
            if (jqXHR.status == 401) {
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