import * as Form from "./form.js";

export const START = 0,
             VIEW = 1,
             CREATE = 2,
             MODIFY = 3;

export let current;

export function start() {
    current = START;
    Form.hide();
}

export function view(Map, selected_hub) {
    current = VIEW;
    Form.viewMode();
    if (selected_hub) {
        Map.changeMarkerMode(selected_hub, VIEW);
    }
    Map.removeTempMarker();
}

export function modify(Map, selected_hub) {
    current = MODIFY;
    Form.modifyMode();
    Map.changeMarkerMode(selected_hub, MODIFY);
    Map.removeTempMarker();
}

export function create() {
    current = CREATE;
    Form.createMode();
}