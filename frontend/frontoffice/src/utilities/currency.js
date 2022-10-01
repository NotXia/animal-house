/**
 * Data una stringa in centesimi, converte la stringa in un prezzo intero
 * @param {String} cents     Valore in centesimi
 * @returns Prezzo intero
 */
export function centToPrice(cents) {
    cents = String(cents);
    let price = (cents).slice(0, cents.length-2) + "," + cents.slice(cents.length-2);

    return price;
}