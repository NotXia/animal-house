import * as Form from "./form.js";
import { Error } from "/admin/import/Error.js";
import * as Airport from "./iataCode.js";

export const START = 0,
             VIEW = 1,
             CREATE = 2,
             MODIFY = 3,
             ERROR = -1;

export let current;
let Map;

export function init(map) {
    Map = map;
}

export function start() {
    current = START;
    Form.hide();
    Map.removeTempMarker();
    Map.hideMarkerTips();
    $("#map-search").show();
    Airport.hideSearchTooltip();
}

export function view(selected_hub) {
    current = VIEW;
    Form.viewMode();
    if (selected_hub) {
        Map.changeMarkerMode(selected_hub, VIEW);
    }
    Map.removeTempMarker();
    Map.hideMarkerTips();
    $("#map-search").show();
    $("#data-address").hide();
    Airport.hideSearchTooltip();
}

export function modify(selected_hub) {
    current = MODIFY;
    Form.modifyMode();
    Map.changeMarkerMode(selected_hub, MODIFY);
    Map.removeTempMarker();
    Map.showMarkerTips(MODIFY);
    $("#map-search").hide();
    $("#data-address").show();
}

export function create() {
    current = CREATE;
    Form.createMode();
    Map.showMarkerTips(CREATE);
    $("#map-search").hide();
    $("#data-address").show();
    Airport.showSearchTooltip();
}

export function error(message) {
    start(Map);
    current = ERROR;
    Error.showError("global", message)
}