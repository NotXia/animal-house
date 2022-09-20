import { Error } from "/admin/import/Error.js";
import * as Form from "./form.js";

export const START = 0,
             CREATE = 1,
             VIEW = 2,
             MODIFY = 3,
             ERROR = -1;

export let current;

export function start() {
    current = START;
    Error.clearErrors();
    $("#form-shop").hide();
}

export function create() {
    current = CREATE;
    Error.clearErrors();
    Form.createMode();
}

export function view() {
    current = VIEW;
    Error.clearErrors();
    Form.viewMode();
}

export function modify() {
    current = MODIFY;
    Error.clearErrors();
    Form.modifyMode();
}

export function error(message) {
    start();
    Error.showError("global", message);
}