export const WEEKS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
export const TRANSLATE = { "monday": "Lunedì", "tuesday": "Martedì", "wednesday": "Mercoledì", "thursday": "Giovedì", "friday": "Venerdì", "saturday": "Sabato", "sunday": "Domenica" };

export function setReadOnly(selector) {
    $(selector).on("click.readonly", function() { return false; });
    $(selector).attr("aria-readonly", true);
}

export function removeReadOnly(selector) {
    $(selector).off("click.readonly");
    $(selector).attr("aria-readonly", false);
}

export function base64(file, header=false) { 
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function () {
            let base64 = reader.result;
            if (!header) { base64 = base64.split(",")[1] } // Rimozione header
            resolve(base64);
        }
        reader.onerror = error => reject(error);
    });
}

/**
 * Converte una stringa che rappresenta un prezzo intero in centesimi
 * @param {*} string_currency   Stringa da convertire
 * @returns Stringa del prezzo in centesimi
 */
 export function priceToCents(string_currency) {
    if (!string_currency.includes(".")) {
        // Se manca la parte decimale, viene aggiunta
        string_currency = string_currency + "00";
    }
    else {
        // Gestisce cifre decimali mancanti (es. 1.2 che dovrebbe essere 1.20)
        let decimals = string_currency.split(".")[1].length;
        for (let i=0; i<2-decimals; i++) { string_currency = string_currency + "0"; }
    }
    return string_currency.replace(".", "");
}

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

export function basename(path) {
    return path.split(/[\\/]/).pop();
}