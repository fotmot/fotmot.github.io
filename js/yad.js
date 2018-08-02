/*
 * Kazakov Ivan
 * mail@x-noname.ru
 */

function setHeader(xhr) {
    xhr.setRequestHeader('Authorization', 'OAuth ' + localStorage['yat']);
}

function handleError(jqXHR, resp) {
    if (jqXHR.status === 403) {
        window.location = 'autorize.html'; // redirect page
    } else if (jqXHR.status === 404) {
        console.error("Unknown error: ", jqXHR);
    } else {
        console.error("Unknown error: ", jqXHR);
    }
}

function q(type, path, data) {
    var getData = "";
    if ((type == "DELETE") && !$.isEmptyObject(data)) {
        getData = "?" + $.param(data);
        data = {};
    }
    return $.ajax({
        url: 'https://cloud-api.yandex.net/v1' + path + getData,
        type: type,
        data: data,
        contentType: 'application/json',
        dataType: "json",
        error: handleError,
        beforeSend: setHeader
    });
}