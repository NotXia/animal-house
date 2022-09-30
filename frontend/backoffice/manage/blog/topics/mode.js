import * as Form from "./form.js";

export const CREATE = 1,
             MODIFY = 2,
             ERROR = -1;

export let current;

export function create() {
    current = CREATE;
    $("#modal-topic-title").text("Crea topic");
    Form.createMode();
}

export function modify() {
    current = MODIFY;
    $("#modal-topic-title").text("Modifica topic");
    Form.modifyMode();
}

export function error(message) {
    current = ERROR;
    $("#global-feedback").html(message);
}