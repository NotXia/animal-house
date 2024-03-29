/**
 * Carica un HTML all'interno di un dato elemento
 * @param {String/Jquery} destination   Elemento in cui caricare il file HTML
 * @param {String}        source        File HTML
 * @returns {Promise}
 */
export async function loader(destination, source) {
    return new Promise(function (resolve, reject) {
        $(destination).load(source, function (response, status, xhr) {
            status == "success" ? resolve() : reject();
        });
    });
}

function loadNavbar(destination) {
    return loader(destination, "/admin/templates/navbar.html");
}

function loadLoading(destination) {
    return loader(destination, "/admin/templates/loading.html");
}