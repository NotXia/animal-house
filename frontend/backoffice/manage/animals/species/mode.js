import * as Form from "./form.js";

export const CREATE = 1,
             MODIFY = 2,
             ERROR = -1;

export let current;

export function create() {
    current = CREATE;
    $("#modal-species-title").text("Crea specie");
    Form.createMode();
}

export function modify() {
    current = MODIFY;
    $("#modal-species-title").text("Modifica specie");
    Form.modifyMode();
}

export function error(message) {
    current = ERROR;
    $("#global-feedback").html(message);
}