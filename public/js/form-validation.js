jQuery.extend(jQuery.validator.messages, {
    required: "Valore mancante",
    remote: "Valore non valido",
    email: "Email non valida",
    url: "URL non valido",
    date: "Data non valida",
    dateISO: "Data non valida",
    number: "Valore numerico non valido",
    digits: "Cifre non valide",
    creditcard: "Numero carta di credito non valido",
    equalTo: "Valore non valido",
    accept: "Estensione non valida",
    maxlength: jQuery.validator.format("Il valore supera il limite di {0}"),
    minlength: jQuery.validator.format("Inserire almeno {0} caratteri"),
    rangelength: jQuery.validator.format("Il valore deve avere una lunghezza compresa tra {0} e {1}"),
    range: jQuery.validator.format("Inserire un valore tra {0} - {1}"),
    max: jQuery.validator.format("Il valore può essere al massimo {0}"),
    min: jQuery.validator.format("Il valore deve essere minimo {0}")
});

jQuery.validator.addMethod("securePassword", function(value, element) {
    const regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/); // 8 caratteri, 1 maiuscola, 1 miniuscola, 1 cifra, 1 carattere speciale
    return this.optional(element) || regex.test(value);
}, "La password non è abbastanza sicura");

/* https://stackoverflow.com/questions/16699007/regular-expression-to-match-standard-10-digit-phone-number */
jQuery.validator.addMethod("phoneNumber", function(value, element) {
    const regex = new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/);
    return this.optional(element) || regex.test(value);
}, "Numero non valido");

/* Il parametro è il selettore di un input time */
jQuery.validator.addMethod("beforeTime", function(value, element, param) {
    return this.optional(element) || moment(value, "HH:mm").isBefore(moment($(param).val(), "HH:mm")) || (!value || !$(param).val());
}, "Intervallo di tempo invalido");

/* Il parametro è il selettore di un input time */
jQuery.validator.addMethod("afterTime", function(value, element, param) {
    return this.optional(element) || moment(value, "HH:mm").isAfter(moment($(param).val(), "HH:mm")) || (!value || !$(param).val());
}, "Intervallo di tempo invalido");

/* Il parametro è il selettore di un input time */
jQuery.validator.addMethod("hubCode", function(value, element) {
    const regex = new RegExp(/^[A-Z]{3}[1-9][0-9]*$/);
    return this.optional(element) || regex.test(value);
}, "Codice hub invalido");