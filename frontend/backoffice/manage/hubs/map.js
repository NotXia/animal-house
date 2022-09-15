import * as Mode from "./mode.js"

let map;
let marker = {}; // Associa hub con il suo marker

const HUB_MARKER_ICON = new L.Icon({
    iconUrl: "/img/sandrone.jfif",
    iconSize: [25, 25],
    // iconAnchor: [12, 41],
});
const MODIFY_HUB_MARKER_ICON = new L.Icon({
    iconUrl: "/img/santandrea.png",
    iconSize: [25, 25],
    // iconAnchor: [12, 41],
});


export function init() {
    /* Inizializzazione mappa */
    map = L.map('map').setView([0, 0], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

/**
 * Centra la mappa su date coordinate
 * @param {float} lat   Latitudine
 * @param {float} lon   Longitudine
 */
export function focusAt(lat, lon) {
    map.flyTo([lat, lon], 16, {animate: true, duration: 0.5});
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
            break;

        case Mode.VIEW: 
        default:        
            marker[hub_code].dragging.disable();
            marker[hub_code].setIcon(HUB_MARKER_ICON);
            break;
    }
}

/**
 * Aggiunge un marker per un hub ad una data posizione
 * @param {float}  lat          Latitudine
 * @param {float}  lon          Longitudine
 * @param {String} hub_code     Codice hub
 * @param {int}    mode         Modalità marker
 */
export function addMarkerAt(lat, lon, hub_code, mode=0) {
    let coord = new L.LatLng(lat, lon);
    
    removeMarker(hub_code);
    
    marker[hub_code] = new L.Marker(coord, { icon: HUB_MARKER_ICON });
    map.addLayer(marker[hub_code]);
    changeMarkerMode(hub_code, mode);
}

/**
 * Restituisce le coordinate puntate dal marker di un dato hub
 * @param {String} hub_code  Codice dell'hub
 * @returns Punto del marker in formato GeoJSON
 */
export function getMarkerCoordinatesOf(hub_code) {
    if (!marker[hub_code]) { return undefined; }

    return {
        type: "Point",
        coordinates: [marker[hub_code].getLatLng().lat, marker[hub_code].getLatLng().lng]
    }
}