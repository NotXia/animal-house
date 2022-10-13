import * as Form from "./form.js";

export const CREATE = 1,
             MODIFY = 2,
             ERROR = -1;

export let current;

export function create() {
    current = CREATE;
    $("#modal-service-title").text("Crea servizio");
    Form.createMode();
}

// export function modify() {
//     current = MODIFY;
//     $("#modal-service-title").text("Modifica servizio");
//     Form.modifyMode();
// }

export function error(message) {
    current = ERROR;
    $("#global-feedback").html(message);
}