import * as Form from "./form.js";

export const CREATE = 1,
             MODIFY = 2,
             ERROR = -1;

export let current;

export function create() {
    current = CREATE;
    $("#modal-category-title").text("Crea categoria");
    Form.createMode();
}

export function modify() {
    current = MODIFY;
    $("#modal-category-title").text("Modifica categoria");
    Form.modifyMode();
}

export function error(message) {
    current = ERROR;
    $("#global-feedback").html(message);
}