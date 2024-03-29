import * as Mode from "./mode.js"

export let map;
let marker = {}; // Associa hub con il suo marker
let tmp_marker = null;
export const CENTER = {lat: 42.744388161339, lon: 12.0809380292276}

const HUB_MARKER_ICON = new L.Icon({
    iconUrl: "/img/markers/shop.png",
    iconSize: [25, 25]
});
const MODIFY_HUB_MARKER_ICON = new L.Icon({
    iconUrl: "/img/markers/shop_orange.png",
    iconSize: [25, 25]
});
const CREATE_HUB_MARKER_ICON = new L.Icon({
    iconUrl: "/img/markers/building.png",
    iconSize: [25, 25]
});


export function init() {
    /* Inizializzazione mappa */
    map = L.map("map-container").setView([0, 0], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }).addTo(map);

    $("#map-container, #map-container *").attr("tabindex", -1); // La mappa non è raggiungibile tramite tab
}

/**
 * Centra la mappa su date coordinate
 * @param {float} lat   Latitudine
 * @param {float} lon   Longitudine
 */
export function focusAt(lat, lon, zoom=16) {
    map.flyTo([lat, lon], zoom, {animate: true, duration: 0.5});
}

export function focusCenter() {
    focusAt(CENTER.lat, CENTER.lon, 5);
}

/**
 * Rimuove il marker di un dato hub
 * @param {String} hub_code  Codice hub
 */
export function removeMarker(hub_code) {
    if (marker[hub_code]) { 
        map.removeLayer(marker[hub_code]); 
    }

    marker[hub_code] = null;
}

/**
 * Cambia il tipo di marker di un dato hub
 * @param {String} hub_code  Codice hub
 * @param {int}    mode      Modalità del marker
 */
export function changeMarkerMode(hub_code, mode) {
    if (!marker[hub_code] || !map.hasLayer(marker[hub_code])) { return; } // Se il marker non è sulla mappa, non fare nulla

    switch (mode) {
        case Mode.MODIFY: 
            marker[hub_code].dragging.enable();
            marker[hub_code].setIcon(MODIFY_HUB_MARKER_ICON);
            marker[hub_code].setZIndexOffset(1000);
            break;

        case Mode.VIEW: 
        default:        
            marker[hub_code].dragging.disable();
            marker[hub_code].setIcon(HUB_MARKER_ICON);
            marker[hub_code].setZIndexOffset(0);
            break;
    }
}

/**
 * Aggiunge un marker per un hub ad una data posizione
 * @param {float}   lat          Latitudine
 * @param {float}   lon          Longitudine
 * @param {String}  hub_code     Codice hub
 * @param {integer} mode         Modalità marker
 */
export function addMarkerAt(lat, lon, hub_code, marker_onclick=()=>{}, mode=0) {
    let coord = new L.LatLng(lat, lon);
    
    removeMarker(hub_code);
    
    marker[hub_code] = new L.Marker(coord, { icon: HUB_MARKER_ICON, keyboard: false });
    map.addLayer(marker[hub_code]);
    marker[hub_code].on('click', function() { marker_onclick(hub_code); });
    changeMarkerMode(hub_code, mode);
}

/**
 * Restituisce le coordinate puntate dal marker di un dato hub
 * @param {String} hub_code  Codice dell'hub
 * @returns Punto del marker in formato GeoJSON
 */
export function getMarkerCoordinatesOf(hub_code) {
    if (!marker[hub_code]) { return undefined; }

    return marker[hub_code].toGeoJSON().geometry;
}


export function addTempMarkerAt(lat, lon) {
    let coord = new L.LatLng(lat, lon);

    removeTempMarker();
    tmp_marker = new L.Marker(coord, { icon: CREATE_HUB_MARKER_ICON, draggable: true, keyboard:false });
    map.addLayer(tmp_marker);
}

export function removeTempMarker() {
    if (tmp_marker) { 
        map.removeLayer(tmp_marker); 
    }
}

export function getTempMarkerCoordinates() {
    if (!tmp_marker) { return undefined; }
    return tmp_marker.toGeoJSON().geometry;
}

export function showMarkerTips(mode) {
    $("#map-suggestion").show();

    switch (mode) {
        case Mode.MODIFY: 
            $("#map-suggestion-marker-icon").attr("src", MODIFY_HUB_MARKER_ICON.options.iconUrl); 
            $("#map-suggestion-marker-icon").attr("alt", "Marker di modifica"); 
            break;
        case Mode.CREATE: 
            $("#map-suggestion-marker-icon").attr("src", CREATE_HUB_MARKER_ICON.options.iconUrl); 
            $("#map-suggestion-marker-icon").attr("alt", "Marker di creazione"); 
            break;
        default:  $("#map-suggestion").hide(); break;
    }
}

export function hideMarkerTips() {
    $("#map-suggestion").hide();
}