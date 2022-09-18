import { Error } from "/admin/import/Error.js";
import * as Form from "./form.js";

export const START = 0,
             ERROR = -1;

export let current;

export function start() {
    $("#form-shop").hide();
}

export function error(message) {
    start();
    Error.showError("global", message);
}