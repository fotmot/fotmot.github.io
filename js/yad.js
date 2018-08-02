/*
 * Kazakov Ivan
 * mail@x-noname.ru
 */
function get_cookie(cookie_name) {
    var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
    if (results)
        return (unescape(results[2]));
    else
        return null;
}

function setHeader(xhr) {
    xhr.setRequestHeader('Authorization', 'OAuth ' + get_cookie('yat'));
}

function handleError(jqXHR, resp) {
    if (jqXHR.status === 403) {
        window.location = 'autorize.html'; // redirect page
    } else if (jqXHR.status === 404) {
        alert("Указанного ресурса не существует");
        $("#folder").click();
        return;
    }else {
        console.error("Unknown error: " , jqXHR);
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