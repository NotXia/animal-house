/**
 * Data una stringa in centesimi, converte la stringa in un prezzo intero
 * @param {String} cents     Valore in centesimi
 * @returns Prezzo intero
 */
export function centToPrice(cents) {
    let price = "";
    cents = String(cents);

    if (cents.length === 1) { price = `0,0${cents}`;}
    else if (cents.length === 2) { price = `0,${cents}`;}
    else {
        price = (cents).slice(0, cents.length-2) + "," + cents.slice(cents.length-2);
    }

    return price;
}