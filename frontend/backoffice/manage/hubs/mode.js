import * as Form from "./form.js";

export const START = 0,
             VIEW = 1,
             CREATE = 2,
             MODIFY = 3;

export let current;

export function start() {
    current = START;
    $("#hub-form").hide();
}

export function view(Map, selected_hub) {
    current = VIEW;
    $("#hub-form").show();
    $("#enable-modify-button-container").show();
    $("#modify-button-container").hide();
    $("#modify-button").attr("type", "button");
    Form.disableForm();
    if (selected_hub) {
        Map.changeMarkerMode(selected_hub, VIEW);
    }
}

export function modify(Map, selected_hub) {
    current = MODIFY;
    $("#hub-form").show();
    $("#enable-modify-button-container").hide();
    $("#modify-button-container").show();
    $("#modify-button").attr("type", "submit");
    Form.enableForm();
    $("#data-code").attr("readonly", true);
    Map.changeMarkerMode(selected_hub, MODIFY);
}