import { Error } from "/admin/import/Error.js";
import * as Form from "./form.js";

export const START = 0,
             CREATE = 1,
             ERROR = -1;

export let current;

export function start() {
    current = START;
    $("#form-shop").hide();
}

export function create() {
    current = CREATE;
    Form.reset();
    Form.createMode();
    $("#form-shop").show();
}

export function error(message) {
    start();
    Error.showError("global", message);
}