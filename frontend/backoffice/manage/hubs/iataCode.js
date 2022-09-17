/**
 * Restituisce il codice IATA dell'aeroporto più vicino a delle date coordinate, filtrando aeroporti di una data nazione
 * @param {float}  lat          Latitudine di partenza
 * @param {float}  lon          Longitudine di partenza
 * @param {String} country      Nazione dell'aeroporto
 * @returns 
 */
export async function getNearestAirportIATA(lat, lon, country) {
    const center_coords = new L.LatLng(lat, lon);
    const SEARCH_RANGE = 150000 /* metri */
    let nearest_airport;

    try {
        // Estrazione aeroporti vicini
        const airports_res = await $.ajax({
            method: "GET", url: `https://overpass-api.de/api/interpreter?data=
                [out:json];
                area["name:it"="${country}"];
                ( nwr(area)[aeroway=aerodrome][aerodrome=international][~"iata|icao"~"."](around:${SEARCH_RANGE}, ${center_coords.lat}, ${center_coords.lng}); );
                out center;
            `
        });

        // Seleziona l'aeroporto meno distante
        let curr_best_distance = Infinity;
        for (const airport of airports_res.elements) {
            const airport_coord = new L.LatLng(airport.center.lat, airport.center.lon);
            const iata = airport.tags.iata;

            const distance = center_coords.distanceTo(airport_coord);
            if (distance < curr_best_distance) { 
                curr_best_distance = distance;
                nearest_airport = iata;
            }
        }
    }
    catch (err) {
        nearest_airport = "";
    }

    return nearest_airport;
}

export function showSearchSpinner() {
    hideSearchError();
    $("#search-airport-spinner").show();
    $("#arialabel-searching-airport > p").attr("aria-hidden", false);
}

export function hideSearchSpinner() {
    $("#search-airport-spinner").hide();
    $("#arialabel-searching-airport > p").attr("aria-hidden", true);
}

export function showSearchError() {
    hideSearchSpinner()
    $("#search-airport-error").show();
    $("#arialabel-searching-airport-error > p").attr("aria-hidden", false);
}

export function hideSearchError() {
    $("#search-airport-error").hide();
    $("#arialabel-searching-airport-error > p").attr("aria-hidden", true);
}