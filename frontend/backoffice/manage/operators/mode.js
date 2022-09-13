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
    $("#operator-form").hide();
    $("#enable_modify-container").hide();
    $("#modify-container").hide();
    $("#create-container").hide();
    Form.readOnlyForm();
    Error.clearErrors();
    Form.resetButtons();
}

export function creation() {
    current = CREATE;
    $("#operator-form").show();
    $("#enable_modify-container").hide();
    $("#modify-container").hide();
    $("#create-container").show();
    Form.enableForm();
    Error.clearErrors();
    Form.resetButtons();
    $("#create-btn").attr("type", "submit");
    $("#data-enabled").prop("checked", true);
    Utils.setReadOnly("#data-enabled");
    $("#data-username").focus();
}

export function view() {
    current = VIEW;
    $("#operator-form").show();
    $("#enable_modify-container").show();
    $("#modify-container").hide();
    $("#create-container").hide();
    Form.readOnlyForm();
    Error.clearErrors();
    Form.resetButtons();
    $("#data-username").focus();
}

export function modify() {
    current = MODIFY;
    $("#operator-form").show();
    $("#enable_modify-container").hide();
    $("#modify-container").show();
    $("#create-container").hide();
    Form.enableForm();
    Error.clearErrors();
    Form.resetButtons();
    $("#data-username").prop("readonly", true);
    $("#data-username").attr("aria-readonly", true);
    $("#save-btn").attr("type", "submit");
    $("#data-username").focus();
}

export function error(message) {
    current = ERROR;
    start();
    Error.showError("global", message);
}