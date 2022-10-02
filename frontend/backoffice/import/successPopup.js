let index = 0;

/**
 * Crea un popup con un messaggio di successo. Il popup scompare automaticamente
 * @param {*} container_selector    Selettore CSS del contenitore del popup
 * @param {*} message               Messaggio da visualizzare
 */
export function createSuccessPopup(container_selector, message) {
    let popup_id = `__success-popup-${index}`
    index++;

    $(container_selector).html(`
        <div id="${popup_id}" class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);

    function autoDismiss() {
        setTimeout(function() {
            if ($(`#${popup_id}`).is(":hover") || $(`#${popup_id}`).is(":focus")) { autoDismiss(); } // Non rimuove il popup se è selezionato
            else { $(`#${popup_id}`).alert("close"); }
        }, 3000);
    }
    autoDismiss();
}