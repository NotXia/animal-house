import {centToPrice} from "../../../../frontoffice/src/utilities/currency.js";

/**
 * Restituisce il contenuto HTML di una riga della tabella dei servizi
 * @param {Service}     service      Dati dei servizi
 * @param {integer}     index      Indice della riga
 * @returns HTML della riga
 */
export function render(service, index) {
    let escaped_name = he.escape(service.name);
    let price = centToPrice(service.price);
}