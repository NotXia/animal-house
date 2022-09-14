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

function base64(file, header=true) { 
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