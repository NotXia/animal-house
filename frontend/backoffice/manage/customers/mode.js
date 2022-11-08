import * as Form from "./form.js";
import {Error} from "../../import/Error.js";
import * as Utils from "/js/utilities.js";

export let current;
export const START = 0,
             VIEW = 1,
             CREATE = 2,
             MODIFY = 3,
             ERROR = -1;

export function start() {
    current = START;
    $("#customer-form").hide();
    $("#enable_modify-container").hide();
    $("#modify-container").hide();
    $("#create-container").hide();
    Form.readOnlyForm();
    Error.clearErrors();
    Form.resetButtons();
}

export function view() {
    current = VIEW;
    $("#customer-form").show();
    $("#enable_modify-container").show();
    $("#modify-container").hide();
    $("#create-container").hide();
    Form.readOnlyForm();
    Error.clearErrors();
    Form.resetButtons();
    $("#data-username").focus();
}

export function error(message) {
    current = ERROR;
    start();
    Error.showError("global", message);
}